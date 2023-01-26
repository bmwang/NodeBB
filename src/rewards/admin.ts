import plugins from '../plugins';
import db from '../database';
import utils from '../utils';

interface Data {
    rewards: number[],
    id: string,
    condition: string
}

interface RewardsPerCondition {
    [key: string]: string[]
}

async function saveConditions(data: Data[]) {
    const rewardsPerCondition: RewardsPerCondition = {};

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await db.delete('conditions:active');
    const conditions: string[] = [];

    data.forEach((reward) => {
        conditions.push(reward.condition);
        rewardsPerCondition[reward.condition] = rewardsPerCondition[reward.condition] || [];
        rewardsPerCondition[reward.condition].push(reward.id);
    });

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await db.setAdd('conditions:active', conditions);

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await Promise.all(Object.keys(rewardsPerCondition).map(c => db.setAdd(`condition:${c}:rewards`, rewardsPerCondition[c])));
}

async function _delete(data: Data) {
    await Promise.all([
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        db.setRemove('rewards:list', data.id),
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        db.delete(`rewards:id:${data.id}`),
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        db.delete(`rewards:id:${data.id}:rewards`),
    ]);
}
export { _delete as delete };

export async function save(data: Data[]): Promise<Data[]> {
    async function save(data: Data) {
        if (!Object.keys(data.rewards).length) {
            return;
        }
        const rewardsData: number[] = data.rewards;
        delete data.rewards;
        if (!parseInt(data.id, 10)) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            data.id = await db.incrObjectField('global', 'rewards:id') as string;
        }
        await _delete(data);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.setAdd('rewards:list', data.id);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.setObject(`rewards:id:${data.id}`, data);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.setObject(`rewards:id:${data.id}:rewards`, rewardsData);
    }

    await Promise.all(data.map(data => save(data)));
    await saveConditions(data);
    return data;
}

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
