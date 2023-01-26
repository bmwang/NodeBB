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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.delete = void 0;
const database_1 = __importDefault(require("../database"));
function saveConditions(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const rewardsPerCondition = {};
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield database_1.default.delete('conditions:active');
        const conditions = [];
        data.forEach((reward) => {
            conditions.push(reward.condition);
            rewardsPerCondition[reward.condition] = rewardsPerCondition[reward.condition] || [];
            rewardsPerCondition[reward.condition].push(reward.id);
        });
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield database_1.default.setAdd('conditions:active', conditions);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield Promise.all(Object.keys(rewardsPerCondition).map(c => database_1.default.setAdd(`condition:${c}:rewards`, rewardsPerCondition[c])));
    });
}
function _delete(data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            database_1.default.setRemove('rewards:list', data.id),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            database_1.default.delete(`rewards:id:${data.id}`),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            database_1.default.delete(`rewards:id:${data.id}:rewards`),
        ]);
    });
}
exports.delete = _delete;
function save(data) {
    return __awaiter(this, void 0, void 0, function* () {
        function save(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!Object.keys(data.rewards).length) {
                    return;
                }
                const rewardsData = data.rewards;
                delete data.rewards;
                if (!parseInt(data.id, 10)) {
                    // The next line calls a function in a module that has not been updated to TS yet
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    data.id = (yield database_1.default.incrObjectField('global', 'rewards:id'));
                }
                yield _delete(data);
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                yield database_1.default.setAdd('rewards:list', data.id);
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                yield database_1.default.setObject(`rewards:id:${data.id}`, data);
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                yield database_1.default.setObject(`rewards:id:${data.id}:rewards`, rewardsData);
            });
        }
        yield Promise.all(data.map(data => save(data)));
        yield saveConditions(data);
        return data;
    });
}
exports.save = save;
// rewards.save = async function (data) {
//     async function save(data) {
//         if (!Object.keys(data.rewards).length) {
//             return;
//         }
//         const rewardsData = data.rewards;
//         delete data.rewards;
//         if (!parseInt(data.id, 10)) {
//             data.id = await db.incrObjectField('global', 'rewards:id');
//         }
//         await rewards.delete(data);
//         await db.setAdd('rewards:list', data.id);
//         await db.setObject(`rewards:id:${data.id}`, data);
//         await db.setObject(`rewards:id:${data.id}:rewards`, rewardsData);
//     }
//     await Promise.all(data.map(data => save(data)));
//     await saveConditions(data);
//     return data;
// };
// rewards.delete = async function (data) {
//     await Promise.all([
//         db.setRemove('rewards:list', data.id),
//         db.delete(`rewards:id:${data.id}`),
//         db.delete(`rewards:id:${data.id}:rewards`),
//     ]);
// };
// rewards.get = async function () {
//     return await utils.promiseParallel({
//         active: getActiveRewards(),
//         conditions: plugins.hooks.fire('filter:rewards.conditions', []),
//         conditionals: plugins.hooks.fire('filter:rewards.conditionals', []),
//         rewards: plugins.hooks.fire('filter:rewards.rewards', []),
//     });
// };
// async function getActiveRewards() {
//     async function load(id) {
//         const [main, rewards] = await Promise.all([
//             db.getObject(`rewards:id:${id}`),
//             db.getObject(`rewards:id:${id}:rewards`),
//         ]);
//         if (main) {
//             main.disabled = main.disabled === 'true';
//             main.rewards = rewards;
//         }
//         return main;
//     }
//     const rewardsList = await db.getSetMembers('rewards:list');
//     const rewardData = await Promise.all(rewardsList.map(id => load(id)));
//     return rewardData.filter(Boolean);
// }
