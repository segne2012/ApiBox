import 'file:///Users/webWorkspace/ApiBox/node_modules/unenv/runtime/polyfill/fetch.node.mjs';
import { Server } from 'http';
import { tmpdir } from 'os';
import path, { join } from 'path';
import fs, { mkdirSync } from 'fs';
import { parentPort, threadId } from 'worker_threads';
import { provider, isWindows } from 'file:///Users/webWorkspace/ApiBox/node_modules/std-env/dist/index.mjs';
import { toEventHandler, defineEventHandler, handleCacheHeaders, createEvent, createApp, createRouter, lazyEventHandler, useQuery, eventHandler } from 'file:///Users/webWorkspace/ApiBox/node_modules/h3/dist/index.mjs';
import { createFetch as createFetch$1, Headers } from 'file:///Users/webWorkspace/ApiBox/node_modules/ohmyfetch/dist/node.mjs';
import destr from 'file:///Users/webWorkspace/ApiBox/node_modules/destr/dist/index.mjs';
import { createRouter as createRouter$1 } from 'file:///Users/webWorkspace/ApiBox/node_modules/radix3/dist/index.mjs';
import { createCall, createFetch } from 'file:///Users/webWorkspace/ApiBox/node_modules/unenv/runtime/fetch/index.mjs';
import { createHooks } from 'file:///Users/webWorkspace/ApiBox/node_modules/hookable/dist/index.mjs';
import { hash } from 'file:///Users/webWorkspace/ApiBox/node_modules/ohash/dist/index.mjs';
import { createStorage } from 'file:///Users/webWorkspace/ApiBox/node_modules/unstorage/dist/index.mjs';
import _unstorage_drivers_fs from 'file:///Users/webWorkspace/ApiBox/node_modules/unstorage/dist/drivers/fs.mjs';
import { withQuery, joinURL } from 'file:///Users/webWorkspace/ApiBox/node_modules/ufo/dist/index.mjs';
import { createRenderer } from 'file:///Users/webWorkspace/ApiBox/node_modules/vue-bundle-renderer/dist/index.mjs';
import devalue from 'file:///Users/webWorkspace/ApiBox/node_modules/@nuxt/devalue/dist/devalue.mjs';
import { snakeCase } from 'file:///Users/webWorkspace/ApiBox/node_modules/scule/dist/index.mjs';
import htmlTemplate from '/Users/webWorkspace/ApiBox/.nuxt/views/document.template.mjs';
import { renderToString as renderToString$2 } from 'file:///Users/webWorkspace/ApiBox/node_modules/vue/server-renderer/index.mjs';

const _runtimeConfig = {app:{baseURL:"\u002F",buildAssetsDir:"\u002F_nuxt\u002F",cdnURL:""},nitro:{routes:{},envPrefix:"NUXT_"},public:{}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}
overrideConfig(_runtimeConfig);
const config = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => config;
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: []
};
function timingMiddleware(_req, res, next) {
  const start = globalTiming.start();
  const _end = res.end;
  res.end = (data, encoding, callback) => {
    const metrics = [["Generate", globalTiming.end(start)], ...globalTiming.metrics];
    const serverTiming = metrics.map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`).join(", ");
    if (!res.headersSent) {
      res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(res, data, encoding, callback);
  };
  next();
}

const serverAssets = [{"baseName":"server","dir":"/Users/webWorkspace/ApiBox/server/assets"}];

const assets = createStorage();

for (const asset of serverAssets) {
  assets.mount(asset.baseName, _unstorage_drivers_fs({ base: asset.dir }));
}

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets);

storage.mount('root', _unstorage_drivers_fs({"driver":"fs","base":"/Users/webWorkspace/ApiBox"}));
storage.mount('src', _unstorage_drivers_fs({"driver":"fs","base":"/Users/webWorkspace/ApiBox/server"}));
storage.mount('build', _unstorage_drivers_fs({"driver":"fs","base":"/Users/webWorkspace/ApiBox/.nuxt"}));
storage.mount('cache', _unstorage_drivers_fs({"driver":"fs","base":"/Users/webWorkspace/ApiBox/.nuxt/cache"}));

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  async function get(key, resolver) {
    const cacheKey = [opts.base, group, name, key].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl;
    const _resolve = async () => {
      if (!pending[key]) {
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      entry.mtime = Date.now();
      entry.integrity = integrity;
      delete pending[key];
      useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return Promise.resolve(entry);
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const key = (opts.getKey || getKey)(...args);
    const entry = await get(key, () => fn(...args));
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length ? hash(args, {}) : "";
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: (event) => {
      return event.req.originalUrl || event.req.url;
    },
    group: opts.group || "nitro/handlers",
    integrity: [
      opts.integrity,
      handler
    ]
  };
  const _handler = toEventHandler(handler);
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const reqProxy = cloneWithProxy(incomingEvent.req, { headers: {} });
    const resHeaders = {};
    const resProxy = cloneWithProxy(incomingEvent.res, {
      statusCode: 200,
      getHeader(name) {
        return resHeaders[name];
      },
      setHeader(name, value) {
        resHeaders[name] = value;
        return this;
      },
      getHeaderNames() {
        return Object.keys(resHeaders);
      },
      hasHeader(name) {
        return name in resHeaders;
      },
      removeHeader(name) {
        delete resHeaders[name];
      },
      getHeaders() {
        return resHeaders;
      }
    });
    const event = createEvent(reqProxy, resProxy);
    const body = await _handler(event);
    const headers = event.res.getHeaders();
    headers.Etag = `W/"${hash(body)}"`;
    headers["Last-Modified"] = new Date().toUTCString();
    const cacheControl = [];
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`);
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
      } else {
        cacheControl.push("stale-while-revalidate");
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`);
    }
    if (cacheControl.length) {
      headers["Cache-Control"] = cacheControl.join(", ");
    }
    const cacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    };
    return cacheEntry;
  }, _opts);
  return defineEventHandler(async (event) => {
    const response = await _cachedHandler(event);
    if (event.res.headersSent || event.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["Last-Modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.res.statusCode = response.code;
    for (const name in response.headers) {
      event.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const plugins = [
  
];

function hasReqHeader(req, header, includes) {
  const value = req.headers[header];
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event.req, "accept", "application/json") || hasReqHeader(event.req, "user-agent", "curl/") || hasReqHeader(event.req, "user-agent", "httpie/") || event.req.url?.endsWith(".json") || event.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Route Not Found" : "Internal Server Error");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(_error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(_error);
  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    description: statusCode !== 404 ? `<pre>${stack.map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n")}</pre>` : ""
  };
  event.res.statusCode = errorObject.statusCode;
  event.res.statusMessage = errorObject.statusMessage;
  if (errorObject.statusCode !== 404) {
    console.error("[nuxt] [request error]", errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.res.setHeader("Content-Type", "application/json");
    event.res.end(JSON.stringify(errorObject));
    return;
  }
  const url = withQuery("/__nuxt_error", errorObject);
  const html = await $fetch(url).catch((error) => {
    console.error("[nitro] Error while generating error response", error);
    return errorObject.statusMessage;
  });
  event.res.setHeader("Content-Type", "text/html;charset=UTF-8");
  event.res.end(html);
});

const _b8f71b = () => Promise.resolve().then(function () { return index$1; });
const _56b294 = () => Promise.resolve().then(function () { return projects$1; });
const _84101f = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: _b8f71b, lazy: true, method: undefined },
  { route: '/api/projects', handler: _56b294, lazy: true, method: undefined },
  { route: '/__nuxt_error', handler: _84101f, lazy: true, method: undefined },
  { route: '/**', handler: _84101f, lazy: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(true),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter();
  const routerOptions = createRouter$1({ routes: config.nitro.routes });
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    const referenceRoute = h.route.replace(/:\w+|\*\*/g, "_");
    const routeOptions = routerOptions.lookup(referenceRoute) || {};
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: "nitro/routes"
      });
    }
    if (h.route === "") {
      h3App.use(config.app.baseURL, handler);
    } else {
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(h3App.nodeHandler);
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();

const server = new Server(nitroApp.h3App.nodeHandler);
function getAddress() {
  if (provider === "stackblitz" || process.env.NITRO_NO_UNIX_SOCKET) {
    return "0";
  }
  const socketName = `worker-${process.pid}-${threadId}.sock`;
  if (isWindows) {
    return join("\\\\.\\pipe\\nitro", socketName);
  } else {
    const socketDir = join(tmpdir(), "nitro");
    mkdirSync(socketDir, { recursive: true });
    return join(socketDir, socketName);
  }
}
const listenAddress = getAddress();
server.listen(listenAddress, () => {
  const _address = server.address();
  parentPort.postMessage({
    event: "listen",
    address: typeof _address === "string" ? { socketPath: _address } : { host: "localhost", port: _address.port }
  });
});
process.on("unhandledRejection", (err) => console.error("[nitro] [dev] [unhandledRejection] " + err));
process.on("uncaughtException", (err) => console.error("[nitro] [dev] [uncaughtException] " + err));

function getName() {
  let firstName = ["\u8D75", "\u94B1", "\u5B59", "\u674E", "\u5468", "\u5434", "\u90D1", "\u738B", "\u51AF", "\u9648", "\u891A", "\u536B", "\u848B", "\u6C88", "\u97E9", "\u6768", "\u6731", "\u79E6", "\u5C24", "\u8BB8", "\u4F55", "\u5415", "\u65BD", "\u5F20", "\u5B54", "\u66F9", "\u4E25", "\u534E", "\u91D1", "\u9B4F", "\u9676", "\u59DC", "\u621A", "\u8C22", "\u90B9", "\u55BB", "\u67CF", "\u6C34", "\u7AA6", "\u7AE0", "\u4E91", "\u82CF", "\u6F58", "\u845B", "\u595A", "\u8303", "\u5F6D", "\u90CE", "\u9C81", "\u97E6", "\u660C", "\u9A6C", "\u82D7", "\u51E4", "\u82B1", "\u65B9", "\u4FDE", "\u4EFB", "\u8881", "\u67F3", "\u9146", "\u9C8D", "\u53F2", "\u5510", "\u8D39", "\u5EC9", "\u5C91", "\u859B", "\u96F7", "\u8D3A", "\u502A", "\u6C64", "\u6ED5", "\u6BB7", "\u7F57", "\u6BD5", "\u90DD", "\u90AC", "\u5B89", "\u5E38", "\u4E50", "\u4E8E", "\u65F6", "\u5085", "\u76AE", "\u535E", "\u9F50", "\u5EB7", "\u4F0D", "\u4F59", "\u5143", "\u535C", "\u987E", "\u5B5F", "\u5E73", "\u9EC4", "\u548C", "\u7A46", "\u8427", "\u5C39"];
  let lastName = ["\u5B50\u7487", "\u6DFC", "\u56FD\u680B", "\u592B\u5B50", "\u745E\u5802", "\u751C", "\u654F", "\u5C1A", "\u56FD\u8D24", "\u8D3A\u7965", "\u6668\u6D9B", "\u660A\u8F69", "\u6613\u8F69", "\u76CA\u8FB0", "\u76CA\u5E06", "\u76CA\u5189", "\u747E\u6625", "\u747E\u6606", "\u6625\u9F50", "\u6768", "\u6587\u660A", "\u4E1C\u4E1C", "\u96C4\u9716", "\u6D69\u6668", "\u7199\u6DB5", "\u6EB6\u6EB6", "\u51B0\u67AB", "\u6B23\u6B23", "\u5B9C\u8C6A", "\u6B23\u6167", "\u5EFA\u653F", "\u7F8E\u6B23", "\u6DD1\u6167", "\u6587\u8F69", "\u6587\u6770", "\u6B23\u6E90", "\u5FE0\u6797", "\u6995\u6DA6", "\u6B23\u6C5D", "\u6167\u5609", "\u65B0\u5EFA", "\u5EFA\u6797", "\u4EA6\u83F2", "\u6797", "\u51B0\u6D01", "\u4F73\u6B23", "\u6DB5\u6DB5", "\u79B9\u8FB0", "\u6DF3\u7F8E", "\u6CFD\u60E0", "\u4F1F\u6D0B", "\u6DB5\u8D8A", "\u6DA6\u4E3D", "\u7FD4", "\u6DD1\u534E", "\u6676\u83B9", "\u51CC\u6676", "\u82D2\u6EAA", "\u96E8\u6DB5", "\u5609\u6021", "\u4F73\u6BC5", "\u5B50\u8FB0", "\u4F73\u742A", "\u7D2B\u8F69", "\u745E\u8FB0", "\u6615\u854A", "\u840C", "\u660E\u8FDC", "\u6B23\u5B9C", "\u6CFD\u8FDC", "\u6B23\u6021", "\u4F73\u6021", "\u4F73\u60E0", "\u6668\u831C", "\u6668\u7490", "\u8FD0\u660A", "\u6C5D\u946B", "\u6DD1\u541B", "\u6676\u6EE2", "\u6DA6\u838E", "\u6995\u6C55", "\u4F73\u94B0", "\u4F73\u7389", "\u6653\u5E86", "\u4E00\u9E23", "\u8BED\u6668", "\u6DFB\u6C60", "\u6DFB\u660A", "\u96E8\u6CFD", "\u96C5\u6657", "\u96C5\u6DB5", "\u6E05\u598D", "\u8BD7\u60A6", "\u5609\u4E50", "\u6668\u6DB5", "\u5929\u8D6B", "\u73A5\u50B2", "\u4F73\u660A", "\u5929\u660A", "\u840C\u840C", "\u82E5\u840C", "\u82E5\u67AB", "\u82E5\u5170", "\u82E5\u84DD", "\u82E5\u7075", "\u82B7\u5929", "\u82B7\u96EA", "\u82B7\u5BB9", "\u8BED\u67AB", "\u590F\u69D0", "\u590F\u5170", "\u6653\u7B60", "\u6653\u69D0", "\u6653\u971C", "\u6653\u9732", "\u6653\u7075", "\u7075\u5349", "\u7075\u69D0", "\u6DD1\u534E", "\u6DD1\u9759", "\u6DD1\u7136", "\u6DD1\u7A46", "\u6DD1\u4E91", "\u6DD1\u6167", "\u6DD1\u5A49", "\u6674\u96EA", "\u6674\u5DDD", "\u6674\u5C9A", "\u6674\u971E", "\u6674\u4E3D", "\u6674\u5DE7", "\u6674\u66E6", "\u6674\u67AB", "\u6674\u6717", "\u6674\u65E5", "\u6674\u6843", "\u6674\u5A49", "\u6674\u5A1F", "\u6674\u971E", "\u6674\u96EF", "\u6674\u8431", "\u6674\u8431", "\u6674\u66E6", "\u6674\u5C9A", "\u6674\u67D4", "\u6674\u5349", "\u6674", "\u6674\u857E", "\u6674\u5C9A", "\u6674\u66DC", "\u6674\u67AB", "\u6674\u4E3D", "\u6674\u5DE7"];
  let firstNameIndex = Math.floor(Math.random() * firstName.length);
  let allName = firstName[firstNameIndex].concat(lastName[Math.floor(Math.random() * lastName.length)]);
  return new String(allName);
}

function getAllProjects() {
  const __dirname = path.resolve();
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/js/urlFiles/projects.json", "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}
const projects$2 = {
  getAllProjects
};

const index = (to, from, next) => {
  let method = to.method;
  let params = useQuery(to);
  switch (to.url) {
    case "/":
      $fetch("/project", { method, body: params });
      next();
      return;
    case "/project":
      next();
      break;
    default:
      return new Promise((resolve, reject) => {
        projects$2.getAllProjects().then((data) => {
          console.log(data, "----name data----");
        });
        let name = getName();
        resolve(new String(name));
      });
  }
};

const index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': index
});

const projects = (to, from) => {
  console.log("----in api ======");
  return new Promise((resolve, reject) => {
    projects$2.getAllProjects().then((data) => {
      console.log(data.baseProject);
      resolve(data);
    });
  });
};

const projects$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': projects
});

function buildAssetsURL(...path) {
  return joinURL(publicAssetsURL(), useRuntimeConfig().app.buildAssetsDir, ...path);
}
function publicAssetsURL(...path) {
  const publicBase = useRuntimeConfig().app.cdnURL || useRuntimeConfig().app.baseURL;
  return path.length ? joinURL(publicBase, ...path) : publicBase;
}

const STATIC_ASSETS_BASE = process.env.NUXT_STATIC_BASE + "/" + process.env.NUXT_STATIC_VERSION;
const NUXT_NO_SSR = process.env.NUXT_NO_SSR;
const PAYLOAD_JS = "/payload.js";
const getClientManifest = cachedImport(() => import('/Users/webWorkspace/ApiBox/.nuxt/dist/server/client.manifest.mjs'));
const getSSRApp = !process.env.NUXT_NO_SSR && cachedImport(() => import('/Users/webWorkspace/ApiBox/.nuxt/dist/server/server.mjs'));
const getSSRRenderer = cachedResult(async () => {
  const clientManifest = await getClientManifest();
  if (!clientManifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getSSRApp();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const { renderToString: renderToString2 } = await Promise.resolve().then(function () { return vue3; });
  return createRenderer(createSSRApp, { clientManifest, renderToString: renderToString2, publicPath: buildAssetsURL() }).renderToString;
});
const getSPARenderer = cachedResult(async () => {
  const clientManifest = await getClientManifest();
  return (ssrContext) => {
    const config = useRuntimeConfig();
    ssrContext.nuxt = {
      serverRendered: false,
      config: {
        public: config.public,
        app: config.app
      }
    };
    let entryFiles = Object.values(clientManifest).filter((fileValue) => fileValue.isEntry);
    if ("all" in clientManifest && "initial" in clientManifest) {
      entryFiles = clientManifest.initial.map((file) => ({ file }));
    }
    return {
      html: '<div id="__nuxt"></div>',
      renderResourceHints: () => "",
      renderStyles: () => entryFiles.flatMap(({ css }) => css).filter((css) => css != null).map((file) => `<link rel="stylesheet" href="${buildAssetsURL(file)}">`).join(""),
      renderScripts: () => entryFiles.map(({ file }) => {
        const isMJS = !file.endsWith(".js");
        return `<script ${isMJS ? 'type="module"' : ""} src="${buildAssetsURL(file)}"><\/script>`;
      }).join("")
    };
  };
});
function renderToString$1(ssrContext) {
  const getRenderer = NUXT_NO_SSR || ssrContext.noSSR ? getSPARenderer : getSSRRenderer;
  return getRenderer().then((renderToString2) => renderToString2(ssrContext));
}
const renderer = eventHandler(async (event) => {
  const ssrError = event.req.url?.startsWith("/__nuxt_error") ? useQuery(event) : null;
  let url = ssrError?.url || event.req.url;
  let isPayloadReq = false;
  if (url.startsWith(STATIC_ASSETS_BASE) && url.endsWith(PAYLOAD_JS)) {
    isPayloadReq = true;
    url = url.slice(STATIC_ASSETS_BASE.length, url.length - PAYLOAD_JS.length) || "/";
  }
  const ssrContext = {
    url,
    event,
    req: event.req,
    res: event.res,
    runtimeConfig: useRuntimeConfig(),
    noSSR: event.req.headers["x-nuxt-no-ssr"],
    error: ssrError,
    redirected: void 0,
    nuxt: void 0,
    payload: void 0
  };
  const rendered = await renderToString$1(ssrContext).catch((e) => {
    if (!ssrError) {
      throw e;
    }
  });
  if (!rendered) {
    return;
  }
  if (ssrContext.redirected || event.res.writableEnded) {
    return;
  }
  const error = ssrContext.error || ssrContext.nuxt?.error;
  if (error && !ssrError) {
    throw error;
  }
  if (ssrContext.nuxt?.hooks) {
    await ssrContext.nuxt.hooks.callHook("app:rendered");
  }
  const payload = ssrContext.payload || ssrContext.nuxt;
  if (process.env.NUXT_FULL_STATIC) {
    payload.staticAssetsBase = STATIC_ASSETS_BASE;
  }
  let data;
  if (isPayloadReq) {
    data = renderPayload(payload, url);
    event.res.setHeader("Content-Type", "text/javascript;charset=UTF-8");
  } else {
    data = await renderHTML(payload, rendered, ssrContext);
    event.res.setHeader("Content-Type", "text/html;charset=UTF-8");
  }
  event.res.end(data, "utf-8");
});
async function renderHTML(payload, rendered, ssrContext) {
  const state = `<script>window.__NUXT__=${devalue(payload)}<\/script>`;
  const html = rendered.html;
  if ("renderMeta" in ssrContext) {
    rendered.meta = await ssrContext.renderMeta();
  }
  const {
    htmlAttrs = "",
    bodyAttrs = "",
    headAttrs = "",
    headTags = "",
    bodyScriptsPrepend = "",
    bodyScripts = ""
  } = rendered.meta || {};
  return htmlTemplate({
    HTML_ATTRS: htmlAttrs,
    HEAD_ATTRS: headAttrs,
    HEAD: headTags + rendered.renderResourceHints() + rendered.renderStyles() + (ssrContext.styles || ""),
    BODY_ATTRS: bodyAttrs,
    BODY_PREPEND: ssrContext.teleports?.body || "",
    APP: bodyScriptsPrepend + html + state + rendered.renderScripts() + bodyScripts
  });
}
function renderPayload(payload, url) {
  return `__NUXT_JSONP__("${url}", ${devalue(payload)})`;
}
function _interopDefault(e) {
  return e && typeof e === "object" && "default" in e ? e.default : e;
}
function cachedImport(importer) {
  return cachedResult(() => importer().then(_interopDefault));
}
function cachedResult(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}

const renderer$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': renderer
});

const renderToString = (...args) => {
  return renderToString$2(...args).then((result) => `<div id="__nuxt">${result}</div>`);
};

const vue3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  renderToString: renderToString
});
//# sourceMappingURL=index.mjs.map
