import moment from 'moment';
export default {
    getStartDateFormater(date) {
        const startDate = moment(date).format('YYYY-MM-DD');
        return `${startDate} 00:00:00`;
    },

    /**
   * End date get
   * @param {String} date
   * @returns
   */
    getEndDateFormater(date) {
        const endDate = moment(date).format('YYYY-MM-DD');
        return `${endDate} 23:59:59`;
    },
};