import React from 'react';
import { configure } from '@storybook/react';
import 'normalize.css';
import '../src/styles/main.css';
import { addDecorator } from '@storybook/react/dist/client/preview';
import Context from '../src/context';
import contextData from './contextDataMock';

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

function loadStories() {
    requireAll(require.context('../src', true, /\.story\.js$/));
}

addDecorator((story) => <Context.Provider value={contextData}>{story()}</Context.Provider>);
configure(loadStories, module);
