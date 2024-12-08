export interface Day {
	name: string;
	day: number;
	month: number;
	year: number;
	isWeekend: boolean;
	isToday: boolean;
	isPast: boolean;
}
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export interface Attendee {
	name: string;
	timezone: string;
	availability: string;
	passwordHash: string;
}

// stole these, not sure if i'll use them lol
export const ordinal = (n: number) => {
	const s = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const formatTime = (date: Date) => {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const amPm = hours >= 12 ? 'pm' : 'am';
	return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
};

export const formatDate = (date: Date) => {
	return `${days[date.getDay()]}, ${months[date.getMonth()]} ${ordinal(date.getDate())}, ${date.getFullYear()}`;
};

export const formatDateTime = (date: Date) => {
	return `${formatDate(date)} at ${formatTime(date)}`;
};

export const formatDuration = (duration: number) => {
	const hours = Math.floor(duration / 3600);
	const minutes = Math.floor((duration % 3600) / 60);
	const seconds = duration % 60;
	return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
