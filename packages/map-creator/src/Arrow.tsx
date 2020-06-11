import * as React from 'react';
import { CoordinatePair, Coordinate } from '@prisel/monopoly-common';
import { TILE_SIZE_PX, GAP_PX } from './common';
import styles from './App.css';

interface ArrowProps {
    path: CoordinatePair;
}

function getDeg(dRow: number, dCol: number): string {
    // arrow can be in 1 of 8 cases
    // dRow = -1, dCol = -1, top left      -135deg
    if (dRow === -1 && dCol === -1) {
        return '-135deg';
    }
    // dRow = -1, dCol =  0, top center    -90deg
    if (dRow === -1 && dCol === 0) {
        return '-90deg';
    }
    // dRow = -1, dCol =  1, top right     -45deg
    if (dRow === -1 && dCol === 1) {
        return '-45deg';
    }
    // dRow =  0, dCol = -1, left          180deg
    if (dRow === 0 && dCol === -1) {
        return '180deg';
    }
    // dRow =  0, dCol =  1, right         0deg
    if (dRow === 0 && dCol === 1) {
        return '0deg';
    }
    // dRow =  1, dCol = -1, bottom left   135deg
    if (dRow === 1 && dCol === -1) {
        return '135deg';
    }
    // dRow =  1, dCol =  0, bottom center 90deg
    if (dRow === 1 && dCol === 0) {
        return '90deg';
    }
    // dRow =  1, dCol =  1, bottom right  45deg
    if (dRow === 1 && dCol === 1) {
        return '45deg';
    }
    throw new Error('cannot draw arrow');
    return '';
}

export const Arrow: React.FC<ArrowProps> = ({ path }) => {
    const dRow = path[1].row - path[0].row;
    const dCol = path[1].col - path[0].col;

    const translateXTiles = (path[1].col + path[0].col + 1) / 2;
    const translateX = translateXTiles * TILE_SIZE_PX + translateXTiles * GAP_PX;
    const translateYTiles = (path[1].row + path[0].row + 1) / 2;
    const translateY = translateYTiles * TILE_SIZE_PX + translateYTiles * GAP_PX;
    const rotateDeg = getDeg(dRow, dCol);
    if (!rotateDeg) {
        return null;
    }

    const arrowWidth = 50; // length
    const arrowHeight = 2;
    const arrowWingWidth = arrowHeight / 2;
    const transform = `translate(${translateX - arrowWidth / 2}px, ${
        translateY - arrowHeight / 2
    }px) rotate(${rotateDeg})`;
    return (
        <div
            className={styles.arrow}
            style={{
                transform,
                width: `${arrowWidth}px`,
                height: `${arrowHeight}px`,
                borderTopWidth: `${arrowWingWidth}px`,
                borderBottomWidth: `${arrowWingWidth}px`,
                borderLeftWidth: `${arrowWidth}px`,
            }}
        />
    );
};
