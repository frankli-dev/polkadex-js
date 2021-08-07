import { add } from '../../src';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
describe('Sample Add Function', () => {

    it('Add fn test passsed' , () => {
        expect(add(3,4)).to.equal(7);
    });

});