"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueIdService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let UniqueIdService = class UniqueIdService {
    generateUniqueId(email) {
        const hash = (0, crypto_1.createHash)('sha256');
        hash.update(email);
        return hash.digest('hex').slice(0, 16);
    }
};
exports.UniqueIdService = UniqueIdService;
exports.UniqueIdService = UniqueIdService = __decorate([
    (0, common_1.Injectable)()
], UniqueIdService);
//# sourceMappingURL=unique-id.service.js.map