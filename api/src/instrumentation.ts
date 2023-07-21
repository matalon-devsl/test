/* eslint-disable @typescript-eslint/no-var-requires */
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
// import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-proto");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const {
  FastifyInstrumentation,
  FastifyRequestInfo,
} = require("@opentelemetry/instrumentation-fastify");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

const fastifyInstrumentation = new FastifyInstrumentation({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  requestHook: function (span, info) {
    span.setAttribute("http.method", info.request.method);
  },
});

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: "jaeger:4318/v1/traces",
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: "jaeger:4318/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
    }),
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new HttpInstrumentation(),
    fastifyInstrumentation,
  ],
});
sdk.start();
