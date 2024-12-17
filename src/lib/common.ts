export interface Day {
	name: string;
	day: number;
	month: number;
	year: number;
	isWeekend: boolean;
	isToday: boolean;
	isPast: boolean;
}

export interface Availability {
	day: string;
	times: string[];
}

export interface Attendee {
	name: string;
	timezone: string;
	availability: string;
	passwordHash?: string;
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

// stole these, not sure if i'll use them lol
export const ordinal = (n: number) => {
	const s = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const formatTime = (input: Date | string, showMinutes: boolean = true) => {
    const format = (hours: number, minutes: number) => {
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return showMinutes ? `${formattedHours}:${formattedMinutes} ${amPm}` : `${formattedHours} ${amPm}`;
    };

    if (typeof input === 'string') {
		// Default minutes to 0 if not provided (e.g. "15" -> "3 PM")
        const [hours, minutes = 0] = input.split(':').map(Number);
        if (hours === 24) {
            return showMinutes ? `12:${minutes.toString().padStart(2, '0')} AM` : '12 AM';
        }
        return format(hours, minutes);
    } else {
        const hours = input.getHours();
        const minutes = input.getMinutes();
        return format(hours, minutes);
    }
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
