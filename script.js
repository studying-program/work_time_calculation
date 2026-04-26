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
    const STANDARD_WORK_HOURS = 8;
    const STANDARD_WORK_MINUTES = STANDARD_WORK_HOURS * MINUTES_PER_HOUR;
    const FOUR_DIGIT_PATTERN = /^\d{4}$/;
    const DEFAULT_RESULT_LABEL = '--時間 --分';

    function setError(message) {
        errorMessage.textContent = message;
    }

    function clearError() {
        setError('');
    }

    function resetResult() {
        totalCumulativeOvertime.textContent = DEFAULT_RESULT_LABEL;
    }

    function formatMinutesAsJapanese(minutes) {
        const sign = minutes < 0 ? '-' : '';
        const absMinutes = Math.abs(minutes);
        const displayHours = Math.floor(absMinutes / MINUTES_PER_HOUR);
        const displayMinutes = absMinutes % MINUTES_PER_HOUR;
        return `${sign}${displayHours}時間 ${displayMinutes}分`;
    }

    // Parse clock time (HHMM) into minutes from 00:00.
    function parseTime(timeString) {
        if (!FOUR_DIGIT_PATTERN.test(timeString)) {
            return null;
        }

        const hours = parseInt(timeString.substring(0, 2), 10);
        const minutes = parseInt(timeString.substring(2, 4), 10);

        if (hours >= HOURS_PER_DAY || minutes >= MINUTES_PER_HOUR) {
            return null;
        }

        return hours * MINUTES_PER_HOUR + minutes;
    }

    // Parse duration-like input (HHMM) into total minutes.
    function parseFourDigitMinutes(timeString) {
        if (!FOUR_DIGIT_PATTERN.test(timeString)) {
            return null;
        }

        const hours = parseInt(timeString.substring(0, 2), 10);
        const minutes = parseInt(timeString.substring(2, 4), 10);

        if (minutes >= MINUTES_PER_HOUR) {
            return null;
        }

        return hours * MINUTES_PER_HOUR + minutes;
    }

    function validateAllInputs(startTimeStr, endTimeStr, breakTimeStr, cumulativeOvertimeStr) {
        if (!FOUR_DIGIT_PATTERN.test(startTimeStr)) {
            return '開始時刻は4桁の数字で入力してください (例: 0900)。';
        }
        if (!FOUR_DIGIT_PATTERN.test(endTimeStr)) {
            return '終了時刻は4桁の数字で入力してください (例: 1800)。';
        }
        if (!FOUR_DIGIT_PATTERN.test(breakTimeStr)) {
            return '休憩時間は4桁の数字で入力してください (例: 0060)。';
        }
        if (!FOUR_DIGIT_PATTERN.test(cumulativeOvertimeStr)) {
            return '前日までの累積残業時間は4桁の数字で入力してください (例: 0120)。';
        }
        if (parseInt(startTimeStr.substring(2, 4), 10) >= MINUTES_PER_HOUR) {
            return '開始時刻の下2桁は60未満で入力してください。';
        }
        if (parseInt(endTimeStr.substring(2, 4), 10) >= MINUTES_PER_HOUR) {
            return '終了時刻の下2桁は60未満で入力してください。';
        }
        if (parseInt(breakTimeStr.substring(2, 4), 10) >= MINUTES_PER_HOUR) {
            return '休憩時間の下2桁は60未満で入力してください。';
        }
        if (parseInt(cumulativeOvertimeStr.substring(2, 4), 10) >= MINUTES_PER_HOUR) {
            return '前日までの累積残業時間の下2桁は60未満で入力してください。';
        }
        return null;
    }

    function calculateAndRender() {
        clearError();
        resetResult();
        const startTimeStr = startTimeInput.value;
        const endTimeStr = endTimeInput.value;
        const breakTimeStr = breakTimeInput.value;
        const cumulativeOvertimeStr = cumulativeOvertimeInput.value;

        const validationError = validateAllInputs(startTimeStr, endTimeStr, breakTimeStr, cumulativeOvertimeStr);
        if (validationError) {
            setError(validationError);
            return;
        }

        let startMinutes = parseTime(startTimeStr);
        let endMinutes = parseTime(endTimeStr);
        let breakMinutes = parseFourDigitMinutes(breakTimeStr);
        let cumulativeOvertimeUntilYesterday = parseFourDigitMinutes(cumulativeOvertimeStr);

        if (startMinutes === null) {
            setError('開始時刻は0000から2359の範囲で入力してください。');
            return;
        }
        if (endMinutes === null) {
            setError('終了時刻は0000から2359の範囲で入力してください。');
            return;
        }
        if (breakMinutes === null) {
            setError('休憩時間の値が不正です。');
            return;
        }
        if (cumulativeOvertimeUntilYesterday === null) {
            setError('前日までの累積残業時間の値が不正です。');
            return;
        }

        // Day crossing support: if end time is numerically smaller, treat as next day.
        if (endMinutes < startMinutes) {
            endMinutes += HOURS_PER_DAY * MINUTES_PER_HOUR;
        }

        const totalDuration = endMinutes - startMinutes;
        // memo.md の指定式をそのまま適用
        const newCumulativeOvertimeMinutes =
            cumulativeOvertimeUntilYesterday - totalDuration - STANDARD_WORK_MINUTES - breakMinutes;

        totalCumulativeOvertime.textContent = formatMinutesAsJapanese(newCumulativeOvertimeMinutes);
    }

    calculateButton.addEventListener('click', calculateAndRender);
    [startTimeInput, endTimeInput, breakTimeInput, cumulativeOvertimeInput].forEach((input) => {
        input.addEventListener('input', calculateAndRender);
    });
});
