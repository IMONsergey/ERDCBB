

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;
const heroAsset = (filename) => assetPath(`/assets/hero/${filename}`);
const rasterAsset = (filename) => assetPath(`/assets/brandbook/raster/${filename}`);
const logoAsset = (filename) => assetPath(`/assets/logos/${filename}`);
const regimeSignAsset = (filename) => assetPath(`/assets/regime-signs/${filename}`);
const subsidiaryAsset = (filename) => assetPath(`/assets/subsidiaries/${filename}`);
const madeSignAsset = (filename) => assetPath(`/assets/made-signs/${filename}`);

export { heroAsset, rasterAsset, logoAsset, regimeSignAsset, subsidiaryAsset, madeSignAsset };
