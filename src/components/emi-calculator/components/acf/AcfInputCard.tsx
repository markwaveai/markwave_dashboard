import React from 'react';
import { useEmi } from '../../context/EmiContext';
import { Minus, Plus } from 'lucide-react';

const AcfInputCard = () => {
    const { acfUnits, setAcfUnits, acfMonthlyInstallment, formatCurrency } = useEmi();

    const updateUnits = (newVal: number) => {
        if (newVal >= 1) setAcfUnits(newVal);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">How many units do you want?</h3>
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => updateUnits(acfUnits - 1)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        <Minus className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="w-16 text-center">
                        <span className="text-3xl font-bold text-gray-900">{acfUnits}</span>
                    </div>

                    <button
                        onClick={() => updateUnits(acfUnits + 1)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="h-12 w-px bg-gray-200"></div>

                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary-600">
                        ₹{formatCurrency(acfUnits * acfMonthlyInstallment)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AcfInputCard;
