import temporalResolutions from '../Enums/temporalResolutions';

const mapTemporalResolutionToNumber = (resolution) => {
    let map = {
        [temporalResolutions.threeMinutes] : 1,
        [temporalResolutions.sixHourly] : 1,
        [temporalResolutions.daily] : 1,
        [temporalResolutions.weekly] : 7,
        [temporalResolutions.monthly] : 30,
        [temporalResolutions.annual] : 365,
        [temporalResolutions.irregular] : null,
        [temporalResolutions.monthlyClimatology]: 30,
        [temporalResolutions.threeDay]: 3,
        [temporalResolutions.eightDayRunning]: 8,
        [temporalResolutions.eightDays]: 8
    };

    return map[resolution];
}

export default mapTemporalResolutionToNumber;