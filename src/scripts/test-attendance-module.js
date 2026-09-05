import express from 'express';
import bodyParser from 'body-parser';
import register from '../routes/index.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import {
    calculateDistanceInMeters,
    calculateShiftMetrics,
    getWorkingDate,
} from '../utils/attendance-helper.js';

const {
    sequelize,
    User,
    Employee,
    Shift,
    Location,
    Branch,
    Country,
    State,
    City,
    Department,
    Designation,
    Attendance,
    AttendanceAudit,
} = models;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
register(app);

async function runTests() {
    console.log('🚀 Starting Comprehensive Attendance Module Test Suite...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected.');

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    let totalTests = 0;
    let passedTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✅ PASS: ${message}`);
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            throw new Error(`Test assertion failed: ${message}`);
        }
    }

    try {
        // --- 0. Setup Prerequisites (Country, State, City, Branch, Department, Designation, Location, Shifts, Users, Employees) ---
        console.log('\n--- 0. Setting up test fixtures ---');
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // 1. Country / State / City
        let country = await Country.findOne({ where: { status: 'active' } });
        if (!country) {
            country = await Country.create({ name: 'TestCountry', isoCode: 'TC', phoneCode: '+99', currencySymbol: '$' });
        }
        let state = await State.findOne({ where: { countryId: country.id } });
        if (!state) {
            state = await State.create({ name: 'TestState', countryId: country.id, isoCode: 'TS' });
        }
        let city = await City.findOne({ where: { stateId: state.id } });
        if (!city) {
            city = await City.create({ name: 'TestCity', stateId: state.id, countryId: country.id });
        }

        // 2. Branch & Location (with Geo coordinates)
        const branch = await Branch.create({
            name: `Attn Branch ${uniqueSuffix}`,
            code: `BR-AT-${uniqueSuffix}`,
            countryId: country.id,
            stateId: state.id,
            cityId: city.id,
        });

        // Office Location: New York (40.7128, -74.0060)
        const location = await Location.create({
            name: `Main Office ${uniqueSuffix}`,
            code: `LOC-AT-${uniqueSuffix}`,
            branchId: branch.id,
            countryId: country.id,
            stateId: state.id,
            cityId: city.id,
            latitude: 40.7128,
            longitude: -74.0060,
            radiusInMeters: 500,
        });

        // 3. Department & Designation
        const department = await Department.create({
            name: `Engineering ${uniqueSuffix}`,
            code: `ENG-${uniqueSuffix}`,
        });
        const designation = await Designation.create({
            name: `Software Engineer ${uniqueSuffix}`,
            code: `SE-${uniqueSuffix}`,
            departmentId: department.id,
        });

        // 4. Shifts: Normal Shift (09:00 - 18:00) & Overnight Shift (22:00 - 06:00)
        const normalShift = await Shift.create({
            name: `General Day Shift ${uniqueSuffix}`,
            code: `SHIFT-DAY-${uniqueSuffix}`,
            startTime: '09:00:00',
            endTime: '18:00:00',
            breakDuration: 60,
            workingHours: 8.0,
            isOvernight: false,
        });

        const overnightShift = await Shift.create({
            name: `Night Shift ${uniqueSuffix}`,
            code: `SHIFT-NIGHT-${uniqueSuffix}`,
            startTime: '22:00:00',
            endTime: '06:00:00',
            breakDuration: 60,
            workingHours: 8.0,
            isOvernight: true,
        });

        // Helper to create user + employee
        const hashedPassword = await bcrypt.hash('Password@123', 10);

        async function createTestAccount(role, firstName, lastName, extra = {}) {
            const accRand = Math.random().toString(36).substring(2, 8);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${accRand}.${uniqueSuffix}@test.com`;
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                status: 'active',
                token: 'mock-token',
            });

            // Generate JWT matching user.id
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                config.jwtSecret || 'PeopleDesk!',
                { expiresIn: '1h' },
            );
            await user.update({ token });

            const employee = await Employee.create({
                employeeCode: `EMP-${firstName.toUpperCase()}-${accRand}`,
                firstName,
                lastName,
                email,
                dateOfJoining: '2024-01-01',
                employmentStatus: extra.employmentStatus || 'active',
                canEmployeeLogin: true,
                userId: user.id,
                departmentId: department.id,
                designationId: designation.id,
                branchId: branch.id,
                locationId: location.id,
                shiftId: extra.shiftId || normalShift.id,
                managerId: extra.managerId || null,
            });

            return { user, employee, token };
        }

        const adminAcc = await createTestAccount('admin', 'Admin', 'User');
        const managerAcc = await createTestAccount('manager', 'Manager', 'Boss');
        const employee1 = await createTestAccount('employee', 'Alice', 'Dev', { managerId: managerAcc.employee.id });
        const employee2 = await createTestAccount('employee', 'Bob', 'QA', { managerId: managerAcc.employee.id });
        const otherEmployee = await createTestAccount('employee', 'Charlie', 'Other'); // Not in manager's team
        const inactiveEmployee = await createTestAccount('employee', 'Diana', 'Inactive', { employmentStatus: 'terminated' });
        const overnightEmp = await createTestAccount('employee', 'Evan', 'NightWorker', { shiftId: overnightShift.id });

        console.log('✅ Test fixtures created successfully.');

        // ==========================================
        // 1. Check-In Tests
        // ==========================================
        console.log('\n--- 1. Testing Employee Check-In ---');

        // Test 1.1: Normal Check-In with Server-Authoritative Time
        const checkInRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${employee1.token}`,
            },
            body: JSON.stringify({
                latitude: 40.7128,
                longitude: -74.0060,
                remarks: 'On time for morning shift',
            }),
        });
        const checkInData = await checkInRes.json();
        assert(checkInRes.status === 200, 'Normal check-in returns HTTP 200');
        assert(checkInData.status === true, 'Check-in response status is true');
        assert(checkInData.result.employeeId === employee1.employee.id, 'Check-in record belongs to authenticated employee');
        assert(!!checkInData.result.checkIn, 'Authoritative checkIn timestamp is generated server-side');
        assert(checkInData.result.checkInIp === '127.0.0.1', 'Client IP is captured server-side');
        assert(checkInData.result.checkInSource === 'web', 'Check-in source is web');

        const firstAttendanceId = checkInData.result.id;

        // Test 1.2: Client Timestamp Manipulation Prevention (Client time is ignored)
        const fakeDateRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${employee2.token}`,
            },
            body: JSON.stringify({
                checkIn: '2020-01-01T00:00:00.000Z', // manipulated client timestamp
                date: '2020-01-01',
            }),
        });
        const fakeDateData = await fakeDateRes.json();
        assert(fakeDateRes.status === 200, 'Employee2 check-in succeeds');
        const checkInYear = new Date(fakeDateData.result.checkIn).getFullYear();
        assert(checkInYear >= 2024, 'Client manipulated timestamp ignored; server timestamp used');

        // Test 1.3: Duplicate Check-In Prevention (Same Day)
        const dupCheckInRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${employee1.token}`,
            },
            body: JSON.stringify({}),
        });
        const dupCheckInData = await dupCheckInRes.json();
        assert(dupCheckInRes.status === 409, 'Duplicate check-in on the same date rejected with 409 Conflict');
        assert(dupCheckInData.status === false, 'Duplicate check-in response status is false');

        // Test 1.4: Employee ID Spoofing Prevention (Client sends employeeId of another user)
        // Employee 2 sends employeeId of Admin in body
        // Attendance should still resolve only to Employee 2's session
        // (Since employee2 is already checked in, it should reject because Employee 2 is checked in)
        const spoofRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${employee2.token}`,
            },
            body: JSON.stringify({ employeeId: adminAcc.employee.id }),
        });
        assert(spoofRes.status === 409, 'Server resolves employee from auth token; spoofed employeeId in body is ignored');

        // Test 1.5: Inactive Employee Check-In Rejection
        const inactiveRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${inactiveEmployee.token}`,
            },
            body: JSON.stringify({}),
        });
        assert(inactiveRes.status === 403, 'Inactive/terminated employee check-in rejected with 403 Forbidden');

        // Test 1.6: Invalid GPS Coordinates Rejection
        const invalidGpsRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${otherEmployee.token}`,
            },
            body: JSON.stringify({
                latitude: 195.5, // Invalid: > 90
                longitude: 45.0,
            }),
        });
        assert(invalidGpsRes.status === 422 || invalidGpsRes.status === 400, 'Invalid GPS coordinates rejected with 422/400');

        // Test 1.7: Geofence Validation (Valid check-in outside radius generates audit warning)
        const geofenceRes = await fetch(`${baseUrl}/attendance/check-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${otherEmployee.token}`,
            },
            body: JSON.stringify({
                latitude: 34.0522, // Los Angeles coordinates (far from NY location)
                longitude: -118.2437,
            }),
        });
        const geofenceData = await geofenceRes.json();
        assert(geofenceRes.status === 200, 'Other employee check-in created with location recorded');
        assert(geofenceData.result.checkInLatitude !== null, 'Coordinates stored for audit verification');

        // Test 1.8: Simultaneous / Concurrent Double Check-In
        console.log('\n--- Testing Concurrent Check-In Race Condition ---');
        const concurrentEmp = await createTestAccount('employee', 'Race', 'Runner');
        const [resA, resB] = await Promise.all([
            fetch(`${baseUrl}/attendance/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${concurrentEmp.token}` },
                body: JSON.stringify({}),
            }),
            fetch(`${baseUrl}/attendance/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${concurrentEmp.token}` },
                body: JSON.stringify({}),
            }),
        ]);
        const statuses = [resA.status, resB.status].sort();
        assert(
            (statuses[0] === 200 && statuses[1] === 409),
            'Concurrent double check-in handled: exactly one succeeds (200) and one is rejected (409)',
        );

        // ==========================================
        // 2. Check-Out Tests
        // ==========================================
        console.log('\n--- 2. Testing Employee Check-Out ---');

        // Test 2.1: Checkout without Check-In Rejection
        const noCheckInEmp = await createTestAccount('employee', 'NoPunch', 'User');
        const noCheckInRes = await fetch(`${baseUrl}/attendance/check-out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${noCheckInEmp.token}`,
            },
            body: JSON.stringify({}),
        });
        assert(noCheckInRes.status === 400, 'Checkout without active check-in rejected with 400 Bad Request');

        // Test 2.2: Normal Check-Out & Shift Duration Calculation
        const checkOutRes = await fetch(`${baseUrl}/attendance/check-out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': '198.51.100.25', // Simulated changed IP
                Authorization: `Bearer ${employee1.token}`,
            },
            body: JSON.stringify({
                latitude: 40.7128,
                longitude: -74.0060,
                remarks: 'Leaving after work',
            }),
        });
        const checkOutData = await checkOutRes.json();
        assert(checkOutRes.status === 200, 'Normal checkout returns HTTP 200');
        assert(!!checkOutData.result.checkOut, 'Authoritative checkOut timestamp generated server-side');
        assert(checkOutData.result.workDuration >= 0, 'Work duration calculated server-side');
        assert(checkOutData.result.checkOutIp === '198.51.100.25', 'Changed checkout IP captured as security signal');

        // Test 2.3: Duplicate Check-Out Prevention
        const dupCheckOutRes = await fetch(`${baseUrl}/attendance/check-out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${employee1.token}`,
            },
            body: JSON.stringify({}),
        });
        assert(dupCheckOutRes.status === 400, 'Duplicate checkout rejected with 400 Bad Request');

        // ==========================================
        // 3. Overnight Shift Calculations Test
        // ==========================================
        console.log('\n--- 3. Testing Overnight Shift Calculations ---');

        // Check overnight working date calculation
        const eveningDate = new Date(2026, 8, 2, 22, 5, 0); // Sep 2, 2026 10:05 PM
        const nextMorningDate = new Date(2026, 8, 3, 6, 10, 0); // Sep 3, 2026 06:10 AM

        const overnightWorkingDate = getWorkingDate(eveningDate, overnightShift);
        assert(overnightWorkingDate === '2026-09-02', 'Evening check-in maps to start date 2026-09-02');

        const metricsOvernight = calculateShiftMetrics({
            checkIn: eveningDate,
            checkOut: nextMorningDate,
            shift: overnightShift,
            workingDate: '2026-09-02',
        });
        assert(metricsOvernight.lateMinutes === 5, 'Overnight late minutes computed accurately (10:05 PM vs 10:00 PM start = 5 min)');
        assert(metricsOvernight.overtimeMinutes === 10, 'Overnight overtime computed accurately (06:10 AM vs 06:00 AM end = 10 min)');
        assert(metricsOvernight.workDuration === 485, 'Total work duration computed across midnight (485 minutes)');

        // ==========================================
        // 4. Access Control & Team Scoping Tests
        // ==========================================
        console.log('\n--- 4. Testing Role-Based Attendance Access ---');

        // Test 4.1: Employee Self-Service (Employee1 can view own record)
        const empViewOwnRes = await fetch(`${baseUrl}/attendance/${firstAttendanceId}`, {
            headers: { Authorization: `Bearer ${employee1.token}` },
        });
        assert(empViewOwnRes.status === 200, 'Employee can view their own attendance record');

        // Test 4.2: Employee cannot view another employee's record
        const empViewOtherRes = await fetch(`${baseUrl}/attendance/${firstAttendanceId}`, {
            headers: { Authorization: `Bearer ${employee2.token}` },
        });
        assert(empViewOtherRes.status === 403, 'Employee cannot view another employee attendance (403 Forbidden)');

        // Test 4.3: Employee cannot view another employee attendance by /employee/:employeeId
        const empViewOtherListRes = await fetch(`${baseUrl}/attendance/employee/${employee1.employee.id}`, {
            headers: { Authorization: `Bearer ${employee2.token}` },
        });
        assert(empViewOtherListRes.status === 403, 'Employee cannot access another employee attendance list (403 Forbidden)');

        // Test 4.4: Manager can view team member attendance
        const mgrViewTeamRes = await fetch(`${baseUrl}/attendance/employee/${employee1.employee.id}`, {
            headers: { Authorization: `Bearer ${managerAcc.token}` },
        });
        const mgrTeamData = await mgrViewTeamRes.json();
        assert(mgrViewTeamRes.status === 200, 'Manager can view their assigned team member attendance');
        assert(mgrTeamData.result.attendances.length > 0, 'Manager gets team member attendance records');

        // Test 4.5: Manager CANNOT view attendance of employee outside their team
        const mgrViewOutsideRes = await fetch(`${baseUrl}/attendance/employee/${otherEmployee.employee.id}`, {
            headers: { Authorization: `Bearer ${managerAcc.token}` },
        });
        assert(mgrViewOutsideRes.status === 403, 'Manager cannot access employees outside their authorized team (403 Forbidden)');

        // Test 4.6: Admin has full access to any attendance
        const adminViewRes = await fetch(`${baseUrl}/attendance/${firstAttendanceId}`, {
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        assert(adminViewRes.status === 200, 'Admin can view any attendance record');

        // ==========================================
        // 5. List, Search, Stats & Pagination Tests
        // ==========================================
        console.log('\n--- 5. Testing List, Filter, Pagination & Stats ---');

        const listRes = await fetch(`${baseUrl}/attendance/list?page=1&limit=10&search=Alice`, {
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        const listData = await listRes.json();
        assert(listRes.status === 200, 'GET /attendance/list returns HTTP 200');
        assert(listData.result.attendances.length >= 1, 'Search by employee name returns matching records');
        assert(listData.result.pagination.page === 1, 'Pagination metadata included');

        const statsRes = await fetch(`${baseUrl}/attendance/stats`, {
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        const statsData = await statsRes.json();
        assert(statsRes.status === 200, 'GET /attendance/stats returns HTTP 200');
        assert(statsData.result.total >= 1, 'Stats aggregation returns total count');

        // ==========================================
        // 6. HR / Admin Correction & Audit Trail Tests
        // ==========================================
        console.log('\n--- 6. Testing HR Correction & Audit Logging ---');

        // Test 6.1: Employee cannot correct attendance
        const empCorrectRes = await fetch(`${baseUrl}/attendance/correct/${firstAttendanceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${employee1.token}`,
            },
            body: JSON.stringify({
                status: 'present',
                correctionReason: 'I want to fix my time',
            }),
        });
        assert(empCorrectRes.status === 401 || empCorrectRes.status === 403, 'Employee cannot perform attendance correction');

        // Test 6.2: Admin performs attendance correction with audit reason
        const adminCorrectRes = await fetch(`${baseUrl}/attendance/correct/${firstAttendanceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminAcc.token}`,
            },
            body: JSON.stringify({
                status: 'present',
                remarks: 'Corrected check-in punch due to biometric machine glitch',
                correctionReason: 'Approved by HR Manager per ticket #HR-101',
            }),
        });
        const adminCorrectData = await adminCorrectRes.json();
        assert(adminCorrectRes.status === 200, 'Admin correction returns HTTP 200');
        assert(adminCorrectData.result.isCorrected === true, 'isCorrected flag marked true');
        assert(adminCorrectData.result.correctionReason === 'Approved by HR Manager per ticket #HR-101', 'Correction reason preserved');
        assert(adminCorrectData.result.correctedBy === adminAcc.user.id, 'Correcting user recorded');

        // Test 6.3: Audit Trail Verification
        const auditRes = await fetch(`${baseUrl}/attendance/audit-logs?attendanceId=${firstAttendanceId}`, {
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        const auditData = await auditRes.json();
        assert(auditRes.status === 200, 'GET /attendance/audit-logs returns HTTP 200');
        assert(auditData.result.logs.length >= 2, 'Audit trail contains CHECK_IN, CHECK_OUT and CORRECTION logs');
        const correctionLog = auditData.result.logs.find((l) => l.action === 'CORRECTION');
        assert(!!correctionLog, 'CORRECTION action exists in audit log');
        assert(correctionLog.reason === 'Approved by HR Manager per ticket #HR-101', 'Audit log records exact correction reason');

        // ==========================================
        // 7. Soft Delete & Restore Tests
        // ==========================================
        console.log('\n--- 7. Testing Soft Delete & Restore ---');

        // Test 7.1: Soft Delete Attendance Record
        const deleteRes = await fetch(`${baseUrl}/attendance-delete/${firstAttendanceId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        assert(deleteRes.status === 200, 'PATCH /attendance-delete/:id returns HTTP 200');

        // Verify record is excluded from normal list
        const afterDeleteListRes = await fetch(`${baseUrl}/attendance/list?employeeId=${employee1.employee.id}`, {
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        const afterDeleteData = await afterDeleteListRes.json();
        const foundDeleted = afterDeleteData.result.attendances.find((a) => a.id === firstAttendanceId);
        assert(!foundDeleted, 'Soft-deleted attendance is excluded from active attendance queries');

        // Test 7.2: Restore Soft Deleted Record
        const restoreRes = await fetch(`${baseUrl}/attendance-restore/${firstAttendanceId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        assert(restoreRes.status === 200, 'PATCH /attendance-restore/:id returns HTTP 200');

        const afterRestoreListRes = await fetch(`${baseUrl}/attendance/list?employeeId=${employee1.employee.id}`, {
            headers: { Authorization: `Bearer ${adminAcc.token}` },
        });
        const afterRestoreData = await afterRestoreListRes.json();
        const foundRestored = afterRestoreData.result.attendances.find((a) => a.id === firstAttendanceId);
        assert(!!foundRestored, 'Restored attendance is present again in active attendance queries');

        console.log(`\n========================================`);
        console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
        console.log(`========================================\n`);

    } catch (err) {
        console.error('\n❌ Test execution failed with error:', err);
        process.exitCode = 1;
    } finally {
        server.close();
        await sequelize.close();
    }
}

runTests();
