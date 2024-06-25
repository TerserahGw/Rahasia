"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var node_cron_1 = require("node-cron");
var nhentai_ts_1 = require("@shineiichijo/nhentai-ts");
var path_1 = require("path");
var fs_1 = require("fs");
var url_1 = require("url");
var user_agent = 'User Agent';
var cookie_value = 'cf_clearance=abcdefghijklmnopq';
var nhentai = new nhentai_ts_1.NHentai({ site: 'nhentai.net', user_agent: user_agent, cookie_value: cookie_value });
var app = (0, express_1.default)();
var port = 3000;
// Create __dirname and __filename
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var latestData = null;
// Schedule the first async function to run every minute
node_cron_1.default.schedule('* * * * *', function () { return __awaiter(void 0, void 0, void 0, function () {
    var data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, nhentai.explore()];
            case 1:
                data = (_a.sent()).data;
                latestData = data;
                console.log('Updated latest data:', latestData);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error exploring nhentai:', error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Ensure the pdf directory exists
var pdfDir = path_1.default.join(__dirname, 'pdf');
if (!fs_1.default.existsSync(pdfDir)) {
    fs_1.default.mkdirSync(pdfDir);
}
// Menambahkan middleware untuk menangani rute '/'
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
// Create an endpoint that triggers the second async function
app.get('/doujin', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, data, doujin, images, pdfFilename_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query.q;
                if (!query) {
                    return [2 /*return*/, res.status(400).send('Query parameter "q" is required')];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, nhentai.search(query, { page: 1 })];
            case 2:
                data = (_a.sent()).data;
                if (data.length === 0) {
                    return [2 /*return*/, res.status(404).send('No doujin found for the given query')];
                }
                doujin = data[0];
                return [4 /*yield*/, doujin.getContents()];
            case 3:
                images = (_a.sent()).images;
                pdfFilename_1 = path_1.default.join(pdfDir, "".concat(query, ".pdf"));
                return [4 /*yield*/, images.PDF(pdfFilename_1)];
            case 4:
                _a.sent();
                res.download(pdfFilename_1, "".concat(query, ".pdf"), function (err) {
                    if (err) {
                        console.error('Error sending the file:', err);
                        res.status(500).send('Error sending the file');
                    }
                    else {
                        // Delete the file after sending it
                        fs_1.default.unlink(pdfFilename_1, function (err) {
                            if (err) {
                                console.error('Error deleting the file:', err);
                            }
                            else {
                                console.log('File deleted:', pdfFilename_1);
                            }
                        });
                    }
                });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error('Error searching nhentai:', error_2);
                res.status(500).send('Error searching nhentai');

