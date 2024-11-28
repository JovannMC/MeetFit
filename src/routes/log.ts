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

function info(message: string) {
	log(LogLevel.INFO, message);
}

function warn(message: string) {
	log(LogLevel.WARN, message);
}

function error(message: string) {
	log(LogLevel.ERROR, message);
}

export { LogLevel, error, info, log, warn };
