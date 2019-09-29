import CommandSuggestionProvider from './CommandSuggestionProvider';
import StringProvider from './StringProvider';
import NumberProvider from './NumberProvider';
import BooleanProvider from './BooleanProvider';
import NullProvider from './NullProvider';
import VariableProvider from './VariableProvider';
import CommandManager from '../commandEditor/commandManager';
export { SuggestionProvider } from './SuggestionProvider';

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
