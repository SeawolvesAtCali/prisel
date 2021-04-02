import { monopolypb, protobuf } from '@prisel/protos';

describe('PropertyInfo', () => {
    test('PropertyInfo contains currentLevel', () => {
        const promptPurchase: monopolypb.PromptPurchaseRequest = {
            property: {
                name: 'name',
                currentLevel: 0,
                cost: 100,
                rent: 10,
            },
            levels: [],
            isUpgrade: false,
            moneyAfterPurchase: 1000,
        };
        const packed = protobuf.any.Any.pack(promptPurchase, monopolypb.PromptPurchaseRequest);
        const unpacked = protobuf.any.Any.unpack(packed, monopolypb.PromptPurchaseRequest);
        expect(unpacked).toEqual(promptPurchase);
        // toJson removes field that matches default value, so currentLevel will
        // not appear.
        expect(
            JSON.stringify(
                protobuf.any.Any.toJson(packed, {
                    typeRegistry: [monopolypb.PromptPurchaseRequest],
                }),
                null,
                2,
            ),
        ).toMatchSnapshot();
    });
});
