document.addEventListener('DOMContentLoaded', () => {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const breakTimeInput = document.getElementById('breakTime');
    const calculateButton = document.getElementById('calculateButton');
    const errorMessage = document.getElementById('errorMessage');
    const resultHoursMinutes = document.getElementById('resultHoursMinutes');
    const resultDecimalHours = document.getElementById('resultDecimalHours');
    const cumulativeOvertimeInput = document.getElementById('cumulativeOvertime');
    const todayOvertime = document.getElementById('todayOvertime');
    const totalCumulativeOvertime = document.getElementById('totalCumulativeOvertime');

    // Constants for time calculations
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;
    const EIGHT_HOURS_IN_MINUTES = 8 * MINUTES_PER_HOUR;

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

    // Function to validate time input (last two digits < 60)
    function validateTimeInput(timeString) {
        if (!/^\d{4}$/.test(timeString)) {
            return false; // Not a 4-digit number
        }
        const minutes = parseInt(timeString.substring(2, 4), 10);
        return minutes < MINUTES_PER_HOUR;
    }

    calculateButton.addEventListener('click', () => {
        errorMessage.textContent = ''; // Clear previous errors
        resultHoursMinutes.textContent = '--時間 --分';
        resultDecimalHours.textContent = '--.--時間';

        const startTimeStr = startTimeInput.value;
        const endTimeStr = endTimeInput.value;
        const breakTimeStr = breakTimeInput.value;

        // Validate time formats
        if (!validateTimeInput(startTimeStr) || !validateTimeInput(endTimeStr)) {
            errorMessage.textContent = '開始時刻または終了時刻の分が60以上です。正しい時刻を入力してください (例: 0959)。';
            return;
        }

        let startMinutes = parseTime(startTimeStr);
        let endMinutes = parseTime(endTimeStr);
        let breakMinutes = parseInt(breakTimeStr, 10);

        // Basic input validation
        if (startMinutes === null || endMinutes === null || isNaN(breakMinutes)) {
            errorMessage.textContent = '入力形式が正しくありません。時刻は4桁の数字 (例: 0900)、休憩時間は数字で入力してください。';
            return;
        }

        if (breakMinutes < 0) {
            errorMessage.textContent = '休憩時間は0以上の数字を入力してください。';
            return;
        }

        // Handle overnight shifts
        if (endMinutes < startMinutes) {
            endMinutes += HOURS_PER_DAY * MINUTES_PER_HOUR; // Add 24 hours
        }

        // Calculate total working minutes (excluding break)
        let totalWorkMinutes = (endMinutes - startMinutes) - breakMinutes;

        // Subtract 8 hours (480 minutes) from the total working minutes
        totalWorkMinutes -= EIGHT_HOURS_IN_MINUTES;

        // Display results
        const hours = Math.floor(totalWorkMinutes / MINUTES_PER_HOUR);
        const minutes = totalWorkMinutes % MINUTES_PER_HOUR;
        resultHoursMinutes.textContent = `${hours}時間 ${minutes}分`;

        const decimalHours = (totalWorkMinutes / MINUTES_PER_HOUR).toFixed(2);
        resultDecimalHours.textContent = `${decimalHours}時間`;

        // Calculate today's overtime/shortage
        let todayOvertimeMinutes = totalWorkMinutes; // Can be negative for shortage

        // Get cumulative overtime from input
        let cumulativeOvertimeUntilYesterday = parseInt(cumulativeOvertimeInput.value, 10);
        if (isNaN(cumulativeOvertimeUntilYesterday)) { // Allow negative for cumulative
            errorMessage.textContent = '前日までの累積残業時間は数字を入力してください。';
            todayOvertime.textContent = '--時間 --分';
            totalCumulativeOvertime.textContent = '--時間 --分';
            return;
        }

        // Calculate total cumulative overtime
        let totalCumulativeOvertimeMinutes = cumulativeOvertimeUntilYesterday + todayOvertimeMinutes;

        // Display today's overtime/shortage
        const displayTodayOvertimeHours = Math.floor(Math.abs(todayOvertimeMinutes) / MINUTES_PER_HOUR);
        const displayTodayOvertimeMins = Math.abs(todayOvertimeMinutes) % MINUTES_PER_HOUR;
        const todayOvertimeSign = todayOvertimeMinutes < 0 ? '-' : '';
        todayOvertime.textContent = `${todayOvertimeSign}${displayTodayOvertimeHours}時間 ${displayTodayOvertimeMins}分`;

        // Display total cumulative overtime
        const totalCumulativeOvertimeHours = Math.floor(totalCumulativeOvertimeMinutes / MINUTES_PER_HOUR);
        const totalCumulativeOvertimeMins = totalCumulativeOvertimeMinutes % MINUTES_PER_HOUR;
        totalCumulativeOvertime.textContent = `${totalCumulativeOvertimeHours}時間 ${totalCumulativeOvertimeMins}分`;
    });
});
