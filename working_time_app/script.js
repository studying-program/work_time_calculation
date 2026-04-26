document.addEventListener('DOMContentLoaded', () => {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const breakTimeInput = document.getElementById('breakTime');
    const calculateButton = document.getElementById('calculateButton');
    const errorMessage = document.getElementById('errorMessage');
    const cumulativeOvertimeInput = document.getElementById('cumulativeOvertime');
    const totalCumulativeOvertime = document.getElementById('totalCumulativeOvertime');

    // Constants for time calculations
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;
    const EIGHT_HOURS_IN_MINUTES = 8 * MINUTES_PER_HOUR; // 8 hours in minutes

    // Function to parse 4-digit time string (HHMM) into total minutes from midnight
    function parseTime(timeString) {
        if (!/^\d{4}$/.test(timeString)) {
            return null; // Invalid format
        }
        const hours = parseInt(timeString.substring(0, 2), 10);
        const minutes = parseInt(timeString.substring(2, 4), 10);

        if (hours >= HOURS_PER_DAY || minutes >= MINUTES_PER_HOUR) {
            return null; // Invalid hours or minutes
        }
        return hours * MINUTES_PER_HOUR + minutes;
    }

    // New function to parse 4-digit string (HHMM) into total minutes (for break/cumulative)
    function parseFourDigitMinutes(timeString) {
        if (!/^\d{4}$/.test(timeString)) {
            return null; // Invalid format
        }
        const hours = parseInt(timeString.substring(0, 2), 10);
        const minutes = parseInt(timeString.substring(2, 4), 10);

        if (minutes >= MINUTES_PER_HOUR) { // Only minutes validation needed for this context
            return null; // Invalid minutes
        }
        return hours * MINUTES_PER_HOUR + minutes;
    }

    // Function to validate 4-digit time input (last two digits < 60)
    function validateFourDigitInput(timeString) {
        if (!/^\d{4}$/.test(timeString)) {
            return false; // Not a 4-digit number
        }
        const minutes = parseInt(timeString.substring(2, 4), 10);
        return minutes < MINUTES_PER_HOUR;
    }

    calculateButton.addEventListener('click', () => {
        errorMessage.textContent = ''; // Clear previous errors
        totalCumulativeOvertime.textContent = '--時間 --分'; // Clear previous result

        const startTimeStr = startTimeInput.value;
        const endTimeStr = endTimeInput.value;
        const breakTimeStr = breakTimeInput.value;
        const cumulativeOvertimeStr = cumulativeOvertimeInput.value;

        // Validate all 4-digit inputs
        if (!validateFourDigitInput(startTimeStr)) {
            errorMessage.textContent = '開始時刻の形式が不正です (例: 0959)。';
            return;
        }
        if (!validateFourDigitInput(endTimeStr)) {
            errorMessage.textContent = '終了時刻の形式が不正です (例: 0959)。';
            return;
        }
        if (!validateFourDigitInput(breakTimeStr)) {
            errorMessage.textContent = '休憩時間の形式が不正です (例: 0059)。';
            return;
        }
        if (!validateFourDigitInput(cumulativeOvertimeStr)) {
            errorMessage.textContent = '前日までの累積残業時間の形式が不正です (例: 0120)。';
            return;
        }

        let startMinutes = parseTime(startTimeStr);
        let endMinutes = parseTime(endTimeStr);
        let breakMinutes = parseFourDigitMinutes(breakTimeStr);
        let cumulativeOvertimeUntilYesterday = parseFourDigitMinutes(cumulativeOvertimeStr);

        // Basic input validation (null means parsing failed due to invalid hours/minutes)
        if (startMinutes === null) {
            errorMessage.textContent = '開始時刻の時または分が不正です。';
            return;
        }
        if (endMinutes === null) {
            errorMessage.textContent = '終了時刻の時または分が不正です。';
            return;
        }
        if (breakMinutes === null) {
            errorMessage.textContent = '休憩時間の時または分が不正です。';
            return;
        }
        if (cumulativeOvertimeUntilYesterday === null) {
            errorMessage.textContent = '前日までの累積残業時間の時または分が不正です。';
            return;
        }

        // Handle overnight shifts
        if (endMinutes < startMinutes) {
            endMinutes += HOURS_PER_DAY * MINUTES_PER_HOUR; // Add 24 hours
        }

        // Implement the exact formula from the prompt:
        // 累積残業時間 = 前日まで累積残業時間 - (終了時刻 - 開始時刻) - 勤務時間（8時間） - 休憩時間
        let totalDuration = endMinutes - startMinutes;
        let newCumulativeOvertimeMinutes = cumulativeOvertimeUntilYesterday - totalDuration - EIGHT_HOURS_IN_MINUTES - breakMinutes;

        // Display total cumulative overtime
        const displayTotalCumulativeOvertimeHours = Math.floor(Math.abs(newCumulativeOvertimeMinutes) / MINUTES_PER_HOUR);
        const displayTotalCumulativeOvertimeMins = Math.abs(newCumulativeOvertimeMinutes) % MINUTES_PER_HOUR;
        const totalCumulativeOvertimeSign = newCumulativeOvertimeMinutes < 0 ? '-' : '';
        totalCumulativeOvertime.textContent = `${totalCumulativeOvertimeSign}${displayTotalCumulativeOvertimeHours}時間 ${displayTotalCumulativeOvertimeMins}分`;
    });
});
