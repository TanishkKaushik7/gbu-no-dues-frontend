import { datadogRum } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";

const SERVICE_NAME = import.meta.env.VITE_DATADOG_SERVICE;
const ENV_NAME = import.meta.env.VITE_DATADOG_ENV;
const VERSION_NUMBER = import.meta.env.VITE_APP_VERSION;
const DATADOG_SITE = import.meta.env.VITE_DATADOG_SITE;

const DATADOG_APP_ID = import.meta.env.VITE_DATADOG_APP_ID;
const DATADOG_CLIENT_TOKEN = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;

if (DATADOG_APP_ID && DATADOG_CLIENT_TOKEN) {
  datadogRum.init({
    applicationId: DATADOG_APP_ID,
    clientToken: DATADOG_CLIENT_TOKEN,
    site: DATADOG_SITE,
    service: SERVICE_NAME,
    env: ENV_NAME,
    version: VERSION_NUMBER,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    trackViewsManually: true,
    plugins: [reactPlugin({ router: false })],
  });

  datadogRum.onReady(() => {
    datadogRum.addAction("rum_sdk_initialized", {
      source: "web",
      mode: import.meta.env.MODE,
    });

    if (import.meta.env.DEV) {
      console.info("[Datadog RUM] SDK initialized");
    }
  });

  datadogRum.startSessionReplayRecording();
}
