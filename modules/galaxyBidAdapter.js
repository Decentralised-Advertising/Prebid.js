import { config } from "../src/config.js";
import { registerBidder } from "../src/adapters/bidderFactory.js";
import { BANNER, VIDEO } from "../src/mediaTypes.js";

const BIDDER_CODE = "galaxy";

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER, VIDEO],
  /**
   * Determines whether or not the given bid request is valid.
   *
   * @param {BidRequest} bid The bid with params to validate.
   * @return boolean True if this is a valid bid, and false otherwise.
   */
  isBidRequestValid: function (bid) {
    return true;
  },
  /**
   * Make a server request from the list of BidRequests.
   *
   * @param {validBidRequests[]} - an array of bids
   * @return ServerRequest Info describing the request to the server.
   */
  buildRequests: function (bidRequests, bidderRequest) {
    // Get currency from config
    const currency = config.getConfig("currency.adServerCurrency");

    // Publisher domain from config
    const publisherDomain = config.getConfig("publisherDomain");

    // First-party data from config
    const fpd = config.getConfig("fpd");

    return {
      method: "POST",
      url: `${config.getConfig("galaxy.endpoint")}/${config.getConfig(
        "galaxy.organization"
      )}`,
      data: JSON.stringify({
        ...bidderRequest,
        ext: { currency, publisherDomain, fpd },
      }),
      options: {
        contentType: "application/json",
      },
    };
  },
  interpretResponse: function (serverResponse, bidRequest) {
    if (
      !serverResponse ||
      !serverResponse.body ||
      typeof serverResponse.body !== "object"
    ) {
      return [];
    }
    if (Array.isArray(serverResponse.body)) {
      return serverResponse.body;
    }
    if (Array.isArray(serverResponse.body.responses)) {
      return serverResponse.body.responses;
    }
    return [];
  },
};
registerBidder(spec);
