import CommandSuggestionProvider from './commandInput/CommandSuggestionProvider';
import StringProvider from './commandInput/StringProvider';
import NumberProvider from './commandInput/NumberProvider';
import BooleanProvider from './commandInput/BooleanProvider';
import NullProvider from './commandInput/NullProvider';
import VariableProvider from './commandInput/VariableProvider';
import CommandManager from './commandEditor/commandManager';

const commandProvider = new CommandSuggestionProvider(CommandManager);
const stringProvider = new StringProvider();
const numberProvider = new NumberProvider();
const booleanProvider = new BooleanProvider();
const nullProvider = new NullProvider();
const variableProvider = new VariableProvider([]);

const providers = [
    commandProvider,
    variableProvider,
    numberProvider,
    nullProvider,
    booleanProvider,
    stringProvider,
];

export default providers;
