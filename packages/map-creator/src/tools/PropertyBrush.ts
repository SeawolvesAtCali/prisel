import { Property, World } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { CanvasForm } from 'pts';
import { CanvasOps } from '../CanvasOps';
import { equal } from '../common';
import { selectObject } from '../events';
import { Tool } from './Tool';

export class PropertyBrush implements Tool {
    constructor(private world: World, private form: CanvasForm, private ops: CanvasOps) {}

    onDown(coor: monopolypb.Coordinate): void {
        const existingProperty = this.world
            .getAll(Property)
            .find((property) => equal(property.anchor, coor));
        if (existingProperty) {
            selectObject.pub(existingProperty);
        } else {
            const property = this.world.create(Property);
            property.anchor = coor;
            property.size = { width: 1, height: 1 };

            property.name = 'unnamed property';
            const defaultCost = 100;
            const defaultRent = 10;
            property.currentLevel = -1;
            property.levels = [
                {
                    cost: defaultCost,
                    rent: defaultRent,
                },
                {
                    cost: defaultCost / 2,
                    rent: defaultRent * 5,
                },
                {
                    cost: defaultCost / 2,
                    rent: defaultRent * 10,
                },
            ];

            if (!property.check()) {
                throw new Error('property creation missing fields');
            }
            selectObject.pub(property);
        }
    }
}
