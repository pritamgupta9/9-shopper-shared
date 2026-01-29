import winston, { Logger } from 'winston';
import { ElasticsearchTransport, Transformer } from 'winston-elasticsearch';
import apm from 'elastic-apm-node';

const esTransformer: Transformer = (logData) => {
  const { level, message, meta, timestamp } = logData;
  return {
    '@timestamp': timestamp,
    level,
    message,
    meta
  };
}

export const winstonLogger = (elasticsearchNode: string, name: string, level: string): Logger => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      json: false,
      colorize: true
    },
    elasticsearch: {
      level,
      transformer: esTransformer,
      apm,
      clientOpts: {
        node: elasticsearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false
      }
    }
  };
  const esTransport: ElasticsearchTransport = new ElasticsearchTransport(options.elasticsearch);
  const logger: Logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: [new winston.transports.Console(options.console), esTransport]
  });
  return logger;
}
