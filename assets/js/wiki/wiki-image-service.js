import { PLACEHOLDER_IMAGE } from "../utils/constants.js";
import { safeUrl } from "../utils/helpers.js";
export const cardImage = item => safeUrl(item?.thumbnailUrl) || safeUrl(item?.imageUrl) || PLACEHOLDER_IMAGE;
export const detailImage = item => safeUrl(item?.imageUrl) || safeUrl(item?.thumbnailUrl) || PLACEHOLDER_IMAGE;
export const imageAttribution = item => ({ sourceUrl:safeUrl(item?.imageSourceUrl), license:item?.imageLicense || null, licenseUrl:safeUrl(item?.imageLicenseUrl), attribution:item?.imageAttribution || null });
