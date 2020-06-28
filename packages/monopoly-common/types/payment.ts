import { PropertyInfo } from './propertyInfo';
export interface Payment {
    from: string;
    to: string;
    amount: number;
    forProperty?: PropertyInfo;
}
