import {MS_PER_MINUTE} from './constants';

export default minutesLeftInActivity

function minutesLeftInActivity(activityName, activities, startTime) {
    const activity = activities && activities[activityName];
    const {idealTime: minutes} = activity || {};
    if (!activity || !startTime || !minutes) {
        return 0;
    }
    const now = new Date();
    startTime = typeof startTime === 'object' ? startTime : new Date(startTime); // FIXME should be a better way to tell if startTime is a date object or not
    const endTime = new Date(startTime + (minutes * MS_PER_MINUTE));
    return (endTime - startTime) / MS_PER_MINUTE;
}
