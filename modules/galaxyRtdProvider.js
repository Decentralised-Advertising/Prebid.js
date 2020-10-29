/**
 * This module adds the decentralised advertising provider to
 * the real time data module.
 * The {@link module:modules/realTimeData} module is required
 * The module will add smart contract evaluation results from a
 * Decentralised Advertising Galaxy server.
 * @module modules/decentralisedAdvertisingProvider
 * @requires module:modules/realTimeData
 */

/**
 * @typedef {Object} ModuleParams
 * @property {string} endpoint
 */
import { config } from "../src/config.js";
import { submodule } from "../src/hook.js";
import { ajax } from "../src/ajax.js";

/** @type {string} */
const REAL_TIME_DATA_MODULE_NAME = "realTimeData";

/** @type {string} */
const PROVIDER_NAME = "galaxy";

/** @type {ModuleParams} */
let _moduleParams = {
  options: {},
};

function getContractEvaluations(adUnits, onDone) {
  if (!_moduleParams.endpoint) {
    return onDone();
  }
  makeRequest(
    _moduleParams.endpoint,
    JSON.stringify(adUnits),
    (err, data) => {
      if (_moduleParams.googletag) {
        // TODO: Call set targeting here based on rtd response...
      }
      if (err) {
        onDone();
      } else {
        onDone(data);
      }
    },
    _moduleParams.options
  );
}

/** @type {RtdSubmodule} */
export const galaxySubmodule = {
  /**
   * used to link submodule with realTimeData
   * @type {string}
   */
  name: "galaxy",
  /**
   * get data and send back to realTimeData module
   * @function
   * @param {adUnit[]} adUnits
   * @param {function} onDone
   */
  getData: getContractEvaluations,
};

export function init(config) {
  const confListener = config.getConfig(
    REAL_TIME_DATA_MODULE_NAME,
    ({ realTimeData }) => {
      if (
        realTimeData.dataProviders &&
        Array.isArray(realTimeData.dataProviders)
      ) {
        const config = realTimeData.dataProviders.find(
          (p) => p.name === PROVIDER_NAME
        );
        if (config && config.endpoint) {
          _moduleParams.endpoint = config.endpoint;
        }
        if (config && config.googletag) {
          _moduleParams.googletag = config.googletag;
        }
      }
      console.log(_moduleParams);
      confListener();
    }
  );
}
submodule(REAL_TIME_DATA_MODULE_NAME, galaxySubmodule);
init(config);

function makeRequest(url, payload, cb, options) {
  ajax(
    url,
    {
      success: function (response, req) {
        if (req.status === 200) {
          try {
            cb(null, JSON.parse(response));
          } catch (err) {
            cb(err, null);
          }
        } else if (req.status === 204) {
          cb(new Error(`received status ${req.status}: ${response}`), {});
        }
      },
      error: function (err) {
        cb(err, null);
      },
    },
    payload,
    { ...options, contentType: "application/json" }
  );
}
