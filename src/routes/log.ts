/* eslint-disable @typescript-eslint/no-explicit-any */
enum LogLevel {
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR'
}

const styles = {
	info: 'color: blue',
	warn: 'color: orange',
	error: 'color: red'
};

function log(level: LogLevel, message: string) {
	let style;
	switch (level) {
		case LogLevel.INFO:
			style = styles.info;
			break;
		case LogLevel.WARN:
			style = styles.warn;
			break;
		case LogLevel.ERROR:
			style = styles.error;
			break;
		default:
			style = '';
	}
	console.log(`%c[${level}]%c ${message}`, style, '');
}

function info(...args: any[]) {
	log(LogLevel.INFO, args.join(' '));
}

function warn(...args: any[]) {
	log(LogLevel.WARN, args.join(' '));
}

function error(...args: any[]) {
	log(LogLevel.ERROR, args.join(' '));
}

export { LogLevel, error, info, log, warn };
