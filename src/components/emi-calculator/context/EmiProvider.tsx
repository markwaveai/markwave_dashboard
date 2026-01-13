import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { EmiContext, EmiRow, YearlyRow, AcfRow } from './EmiContext';

// Constants
const CPF_PER_UNIT_YEARLY = 15000.0;
const MARKET_UNIT_VALUE = 350000.0;
const ACF_INSTALLMENT_11_MONTHS = 30000.0;
const ACF_INSTALLMENT_30_MONTHS = 10000.0;

export const EmiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- EMI Calculator State ---
    const [amount, setAmount] = useState(400000); // 4L default
    const [rate, setRate] = useState(18.0);
    const [months, setMonths] = useState(60);
    const [units, setUnits] = useState(1);
    const [cpfEnabled, setCpfEnabled] = useState(true);
    const [cgfEnabled, setCgfEnabled] = useState(false);

    // --- ACF State ---
    const [acfUnits, setAcfUnits] = useState(1);
    const [acfTenureMonths, setAcfTenureMonths] = useState(30); // 11 or 30
    const [acfProjectionYear, setAcfProjectionYear] = useState(1);
    const [acfRevenueProjectionYear, setAcfRevenueProjectionYear] = useState(1);

    // --- Simulation Results State ---
    const [schedule, setSchedule] = useState<EmiRow[]>([]);
    const [yearlySchedule, setYearlySchedule] = useState<YearlyRow[]>([]); // For yearly view

    // Derived Totals
    const [emi, setEmi] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalCpf, setTotalCpf] = useState(0);
    const [totalCgf, setTotalCgf] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalLoss, setTotalLoss] = useState(0);
    const [totalNetCash, setTotalNetCash] = useState(0);

    // Asset Values
    const [totalAssetValue, setTotalAssetValue] = useState(0);

    // --- Formatting ---
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        }).format(value);
    };

    // --- Helpers from Flutter Logic ---

    // Asset Valuation Logic
    const getValuationForAge = (ageInMonths: number) => {
        if (ageInMonths >= 41) return 175000;
        if (ageInMonths >= 35) return 150000;
        if (ageInMonths >= 25) return 100000;
        if (ageInMonths >= 19) return 40000;
        if (ageInMonths >= 13) return 25000;
        return 10000;
    };

    const calculateAgeInMonths = (buffalo: any, targetYear: number, targetMonth: number = 0) => {
        const birthYear = buffalo.birthYear;
        // Use birthMonth if available, fall back to acquisitionMonth or 0
        const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
        const totalMonths = (targetYear - birthYear) * 12 + (targetMonth - birthMonth);
        return Math.max(0, totalMonths);
    };

    // CGF Cost Logic
    const getMonthlyCgfForCalfAge = (age: number) => {
        if (age <= 12) return 0; // 0-12 months free
        if (age <= 18) return 1000; // 13-18 months
        if (age <= 24) return 1400; // 19-24 months
        if (age <= 30) return 1800; // 25-30 months
        if (age <= 36) return 2500; // 31-36 months
        return 0;
    };

    // Revenue Logic
    const getRevenueForAdult = (month: number, revenueStartMonth: number) => {
        if (month < revenueStartMonth) return 0;
        const k = month - revenueStartMonth;
        const cyclePos = k % 12;
        if (cyclePos >= 0 && cyclePos <= 4) return 9000; // Peak
        if (cyclePos >= 5 && cyclePos <= 7) return 6000; // Mid
        return 0; // Dry
    };

    const getRevenueForCalf = (month: number, cycleBaseMonth: number) => {
        if (month < cycleBaseMonth) return 0;
        const k = month - cycleBaseMonth;
        const cyclePos = k % 12;
        if (cyclePos <= 1) return 0;
        if (cyclePos <= 6) return 9000;
        if (cyclePos <= 9) return 6000;
        return 0;
    };

    // Simulation Core
    // Generates the schedule array
    const simulateConfig = (pAmount: number, pRate: number, pMonths: number, pUnits: number, pCpf: boolean, pCgf: boolean) => {
        const principal = pAmount;
        const monthlyRate = pRate / 12 / 100;

        let emiLocal = 0;
        if (monthlyRate === 0) {
            emiLocal = principal / (pMonths > 0 ? pMonths : 1);
        } else {
            const powFactor = Math.pow(1 + monthlyRate, pMonths);
            emiLocal = (principal * monthlyRate * powFactor) / (powFactor - 1);
        }

        let balance = principal;
        const rows: EmiRow[] = [];

        // Capital Requirement Calculation
        const perUnitBase = 350000.0;
        const perUnitCpf = CPF_PER_UNIT_YEARLY;
        const requiredPerUnit = perUnitBase + (pCpf ? perUnitCpf : 0.0);
        const requiredCapital = requiredPerUnit * pUnits;

        // Excess loan amount becomes "Loan Pool" (Working Capital)
        let loanPool = principal > requiredCapital ? (principal - requiredCapital) : 0.0;

        // Simulation Parameters
        const orderMonthBuff1 = 1;
        const orderMonthBuff2 = 7;
        const revenueStartBuff1 = 3;
        const revenueStartBuff2 = 9;

        const calfRevenueStartMonths: number[] = [];
        const calfCpfStartMonths: number[] = [];
        const allBirthMonths: number[] = [];

        // Helper to track births
        const trackBirths = (firstBirthMonth: number) => {
            for (let bm = firstBirthMonth; bm <= pMonths; bm += 12) {
                allBirthMonths.push(bm);

                // CPF Start (Direct)
                const cpfStart = bm + 24;
                if (cpfStart <= pMonths) calfCpfStartMonths.push(cpfStart);

                // Revenue Start (Direct)
                const revStart = bm + 33;
                if (revStart <= pMonths) calfRevenueStartMonths.push(revStart);

                // Grand Births (Gen 2)
                const firstGrandBaby = bm + 36;
                if (firstGrandBaby <= pMonths) {
                    for (let gb = firstGrandBaby; gb <= pMonths; gb += 12) {
                        allBirthMonths.push(gb);
                    }
                }
            }
        };

        trackBirths(orderMonthBuff1);
        trackBirths(orderMonthBuff2);

        const monthlyCpfPerAnimal = CPF_PER_UNIT_YEARLY / 12;

        for (let m = 1; m <= pMonths; m++) {
            const interestForMonth = balance * monthlyRate;
            let principalForMonth = emiLocal - interestForMonth;

            if (m === pMonths) principalForMonth = balance; // Close loan
            if (principalForMonth < 0) principalForMonth = 0;

            balance -= principalForMonth;
            if (balance < 0.000001) balance = 0;

            // CGF
            let cgfPerUnit = 0;
            if (pCgf) {
                for (const birthMonth of allBirthMonths) {
                    if (m >= birthMonth) {
                        const currentAge = (m - birthMonth) + 1;
                        cgfPerUnit += getMonthlyCgfForCalfAge(currentAge);
                    }
                }
            }
            const cgf = cgfPerUnit * pUnits;

            // Revenue
            let revenuePerUnit = 0;
            revenuePerUnit += getRevenueForAdult(m, revenueStartBuff1);
            revenuePerUnit += getRevenueForAdult(m, revenueStartBuff2);

            for (const startMonth of calfRevenueStartMonths) {
                revenuePerUnit += getRevenueForCalf(m, startMonth);
            }
            const revenue = revenuePerUnit * pUnits;

            // CPF
            let cpf = 0;
            if (pCpf) {
                if (m > 12) {
                    // Adult CPFs
                    if (m >= orderMonthBuff1) cpf += monthlyCpfPerAnimal * pUnits;
                    if (m >= orderMonthBuff2 + 12) cpf += monthlyCpfPerAnimal * pUnits;

                    // Calf CPFs
                    for (const start of calfCpfStartMonths) {
                        if (m >= start) cpf += monthlyCpfPerAnimal * pUnits;
                    }
                }
            }

            // Payments Logic: Try to pay from Revenue -> Then Loan Pool -> Then Loss (Pocket)
            let emiFromRevenue = revenue >= emiLocal ? emiLocal : revenue;
            let remainingRevenue = revenue - emiFromRevenue;
            let emiFromLoanPool = 0;

            let remainingEmi = emiLocal - emiFromRevenue;
            if (remainingEmi > 0 && loanPool > 0) {
                const take = remainingEmi <= loanPool ? remainingEmi : loanPool;
                emiFromLoanPool = take;
                loanPool -= take;
                remainingEmi -= take;
            }

            let cpfFromRevenue = 0;
            let remainingCpf = cpf;
            if (remainingRevenue > 0 && remainingCpf > 0) {
                const take = remainingRevenue <= remainingCpf ? remainingRevenue : remainingCpf;
                cpfFromRevenue = take;
                remainingRevenue -= take;
                remainingCpf -= take;
            }

            let cpfFromLoanPool = 0;
            if (remainingCpf > 0 && loanPool > 0) {
                const take = remainingCpf <= loanPool ? remainingCpf : loanPool;
                cpfFromLoanPool = take;
                loanPool -= take;
                remainingCpf -= take;
            }

            let cgfFromRevenue = 0;
            let remainingCgf = cgf;
            if (remainingRevenue > 0 && remainingCgf > 0) {
                const take = remainingRevenue <= remainingCgf ? remainingRevenue : remainingCgf;
                cgfFromRevenue = take;
                remainingRevenue -= take;
                remainingCgf -= take;
            }

            let cgfFromLoanPool = 0;
            if (remainingCgf > 0 && loanPool > 0) {
                const take = remainingCgf <= loanPool ? remainingCgf : loanPool;
                cgfFromLoanPool = take;
                loanPool -= take;
                remainingCgf -= take;
            }

            let loss = remainingEmi + remainingCpf + remainingCgf;
            if (loss < 0) loss = 0;

            let profit = remainingRevenue;
            if (profit < 0) profit = 0;
            if (profit > 0) loanPool += profit;

            rows.push({
                month: m,
                emi: emiLocal,
                interest: interestForMonth,
                principal: principalForMonth,
                balance: balance,
                revenue,
                cpf,
                cgf,
                emiFromRevenue,
                emiFromLoanPool,
                cpfFromRevenue,
                cpfFromLoanPool,
                cgfFromRevenue,
                cgfFromLoanPool,
                loanPoolBalance: loanPool,
                profit,
                loss,
                // Add aliases for easier table matching
                totalPayment: emiLocal + cpf + cgf,
                debitFromBalance: emiFromLoanPool + cpfFromLoanPool + cgfFromLoanPool,
                netCash: profit - loss
            });
        }
        return { rows, emi: emiLocal };
    };

    // Herd Simulation for Asset Valuations
    const simulateHerd = (tenureMonths: number, unitCount: number) => {
        const orderMonthBuff1 = 1;
        const orderMonthBuff2 = 7;

        // Just return list of ages for offspring (for a SINGLE unit).
        const offspringAges: number[] = [];
        const trackOffspring = (startMonth: number) => {
            // Direct 
            for (let bm = startMonth; bm <= tenureMonths; bm += 12) {
                offspringAges.push((tenureMonths - bm) + 1); // Age in months at end

                // Grand
                const firstGrand = bm + 36;
                if (firstGrand <= tenureMonths) {
                    for (let gb = firstGrand; gb <= tenureMonths; gb += 12) {
                        offspringAges.push((tenureMonths - gb) + 1);
                    }
                }
            }
        }
        trackOffspring(orderMonthBuff1);
        trackOffspring(orderMonthBuff2);

        // We return the ages for a SINGLE unit now, to avoid massive array creation crash.
        // multi-unit scaling happens in calculateAssetValueFromSimulation
        return offspringAges;
    };

    const calculateAssetValueFromSimulation = (singleUnitOffspringAges: number[], pUnits: number) => {
        const adultValue = 175000 * 2 * pUnits;

        let singleUnitOffspringValue = 0;
        for (const age of singleUnitOffspringAges) {
            singleUnitOffspringValue += getValuationForAge(age);
        }

        // Total = Adults + (Single Unit Offspring Total * Unit Count)
        return adultValue + (singleUnitOffspringValue * pUnits);
    }

    // Precise Simulation for Asset Valuation (Matching Buffalo Vis)
    const calculateProjectedAssetValue = (targetYearIndex: number, unitCount: number) => {
        // targetYearIndex is 1-based (Year 1, Year 2...)
        // We simulate from now (Year 0) to Year target.

        const startYear = new Date().getFullYear(); // Or fixed 2026? Let's use 2026 to match Vis defaults if needed, but current year is safer.
        // Actually, Buffalo Vis default is 2026. Let's stick to dynamic current year for Calculator context.
        const startMonth = 0; // Jan
        const startDay = 1;

        const totalYears = targetYearIndex;
        const herd: any[] = [];
        const offspringCounts: any = {};

        // 1. Initial Herd Creation
        for (let u = 0; u < unitCount; u++) {
            // First buffalo (Jan)
            const id1 = `U${u + 1}A`;
            const absAcq1 = startYear * 12 + startMonth;
            herd.push({
                id: id1,
                age: 5,
                generation: 0,
                birthYear: startYear - 5,
                acquisitionMonth: startMonth,
                absoluteAcquisitionMonth: absAcq1,
                birthMonth: startMonth,
            });

            // Second buffalo (July)
            const id2 = `U${u + 1}B`;
            const absAcq2 = startYear * 12 + startMonth + 6;
            herd.push({
                id: id2,
                age: 5,
                generation: 0,
                birthYear: startYear - 5,
                acquisitionMonth: (startMonth + 6) % 12,
                absoluteAcquisitionMonth: absAcq2,
                birthMonth: (startMonth + 6) % 12,
            });
        }

        // 2. Simulation Loop
        const totalMonthsDuration = totalYears * 12;
        const absoluteStartMonth = startYear * 12 + startMonth;
        const absoluteEndMonth = absoluteStartMonth + totalMonthsDuration - 1;

        // Simulate year by year
        for (let year = 1; year <= totalYears; year++) {
            const currentYear = startYear + (year - 1);

            // Snapshot current herd to iterate safely
            const currentHerd = [...herd];

            currentHerd.forEach(parent => {
                if (parent.generation === 0) {
                    const birthMonth = parent.acquisitionMonth;
                    const absoluteBirthMonth = currentYear * 12 + birthMonth;

                    if (absoluteBirthMonth >= absoluteStartMonth && absoluteBirthMonth <= absoluteEndMonth) {
                        if (!offspringCounts[parent.id]) offspringCounts[parent.id] = 0;
                        offspringCounts[parent.id]++;
                        const newId = `${parent.id}_C${offspringCounts[parent.id]}`;

                        herd.push({
                            id: newId,
                            age: 0,
                            generation: parent.generation + 1,
                            birthYear: currentYear,
                            birthMonth: birthMonth,
                            acquisitionMonth: birthMonth,
                            absoluteAcquisitionMonth: absoluteBirthMonth,
                            parentId: parent.id
                        });
                    }
                } else {
                    // Gen > 0
                    const yearStartAbs = currentYear * 12;
                    const yearEndAbs = yearStartAbs + 11;
                    const parentBirthAbs = parent.absoluteAcquisitionMonth || (parent.birthYear * 12 + (parent.birthMonth || 0));

                    for (let k = 0; k < 15; k++) {
                        const milestoneAbs = parentBirthAbs + 32 + (k * 12); // 32 month gap? Vis says 34 threshold for mature, but calculation loop used 32+k*12 logic? 
                        // Looking at BuffaloFamilyTree:
                        // "const milestoneAbs = parentBirthAbs + 32 + (k * 12);"
                        // Yes, line 394 in index.tsx.

                        if (milestoneAbs >= yearStartAbs && milestoneAbs <= yearEndAbs) {
                            if (milestoneAbs > absoluteEndMonth) continue;
                            if (milestoneAbs < absoluteStartMonth) continue;

                            const birthMonth = milestoneAbs % 12;
                            if (!offspringCounts[parent.id]) offspringCounts[parent.id] = 0;
                            offspringCounts[parent.id]++;
                            const newId = `${parent.id}_C${offspringCounts[parent.id]}`;

                            herd.push({
                                id: newId,
                                age: 0,
                                generation: parent.generation + 1,
                                birthYear: currentYear,
                                birthMonth: birthMonth,
                                acquisitionMonth: birthMonth,
                                absoluteAcquisitionMonth: milestoneAbs,
                                parentId: parent.id
                            });
                        }
                    }
                }
            });
        }

        // 3. Calculate Final Value
        const endYear = startYear + Math.floor((startMonth + totalMonthsDuration - 1) / 12);
        const endMonthOfSimulation = absoluteEndMonth % 12; // 11 usually
        const targetMonth = (endMonthOfSimulation === 11) ? 12 : endMonthOfSimulation; // End of year

        let totalAssetValue = 0;
        herd.forEach(buffalo => {
            if (buffalo.birthYear <= endYear) {
                const birthAbsolute = buffalo.birthYear * 12 + (buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0));
                if (birthAbsolute <= absoluteEndMonth) {
                    const ageInMonths = calculateAgeInMonths(buffalo, endYear, targetMonth);
                    totalAssetValue += getValuationForAge(ageInMonths);
                }
            }
        });

        return { totalAssetValue, totalBuffaloes: herd.length };
    };

    // --- Dynamic Interest Rate Logic ---
    const OPTIMIZE_RATE = true; // Toggle for the feature

    const findMaxSafeRate = (pAmount: number, pMonths: number, pUnits: number, pCpf: boolean, pCgf: boolean) => {
        const LOW = 9.0;
        const HIGH = 24.0;
        const PRECISION = 0.1;

        let left = LOW;
        let right = HIGH;
        let bestRate = LOW;

        // Helper check: does this rate result in ZERO total loss?
        const isSafe = (r: number) => {
            const { rows } = simulateConfig(pAmount, r, pMonths, pUnits, pCpf, pCgf);
            const tLoss = rows.reduce((acc, row) => acc + row.loss, 0);
            return tLoss < 1.0; // Tolerance for floating point noise
        };

        // Quick check: is even 9% unsafe?
        if (!isSafe(LOW)) return LOW; // Return min rate even if unsafe (per requirements)

        // Binary Search for MAX rate
        while (right - left > PRECISION) {
            const mid = (left + right) / 2;
            if (isSafe(mid)) {
                bestRate = mid;
                left = mid; // Try higher
            } else {
                right = mid; // Too high, go lower
            }
        }

        return Number(bestRate.toFixed(1));
    };

    // Auto-adjust rate when parameters change
    useEffect(() => {
        if (OPTIMIZE_RATE) {
            // We only trigger if the current rate setting would be INVALID or if amount changed.
            // Actually, requirements say "change interest rate based on given amount".
            // So we should re-calculate whenever amount/units/tenure changes.

            // To prevent infinite loops if setRate triggers this again, we only set if different.
            // However, we must be careful not to override user manual input if they want to override.
            // But the requirement implies an automatic rule. Let's assume automatic enforcement.

            const optimized = findMaxSafeRate(amount, months, units, cpfEnabled, cgfEnabled);
            if (optimized !== rate) {
                // console.log(`Optimizing Rate: ${rate} -> ${optimized} for Amt: ${amount}`);
                setRate(optimized);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, months, units, cpfEnabled, cgfEnabled]);

    // --- Effects to Update State ---
    useEffect(() => {
        const { rows, emi: calcEmi } = simulateConfig(amount, rate, months, units, cpfEnabled, cgfEnabled);

        setEmi(calcEmi);
        setSchedule(rows);

        // Calculate Totals
        const tRev = rows.reduce((acc, r) => acc + r.revenue, 0);
        const tCpf = rows.reduce((acc, r) => acc + r.cpf, 0);
        const tCgf = rows.reduce((acc, r) => acc + r.cgf, 0);
        const tProfit = rows.reduce((acc, r) => acc + r.profit, 0);
        const tLoss = rows.reduce((acc, r) => acc + r.loss, 0);

        // Net Cash is usually Profit - Loss
        setTotalRevenue(tRev);
        setTotalCpf(tCpf);
        setTotalCgf(tCgf);
        setTotalProfit(tProfit);
        setTotalLoss(tLoss);
        setTotalNetCash(tProfit - tLoss);

        // Derived financial totals
        // const tPrincip = rows.reduce((acc, r) => acc + r.principal, 0); // Should match amount roughly
        const tInt = rows.reduce((acc, r) => acc + r.interest, 0);

        setTotalPayment(calcEmi * months);
        setTotalInterest(tInt);

        // Asset Value
        const herdAges = simulateHerd(months, units);
        const assetVal = calculateAssetValueFromSimulation(herdAges, units);
        setTotalAssetValue(assetVal);

        // Yearly Schedule Generation
        const yearly: YearlyRow[] = [];
        const numYears = Math.ceil(months / 12);
        for (let i = 0; i < numYears; i++) {
            const start = i * 12;
            const end = Math.min((i + 1) * 12, rows.length);
            const chunk = rows.slice(start, end);

            const yEmi = chunk.reduce((s, r) => s + r.emi, 0);
            const yRev = chunk.reduce((s, r) => s + r.revenue, 0);
            const yCpf = chunk.reduce((s, r) => s + r.cpf, 0);
            const yCgf = chunk.reduce((s, r) => s + r.cgf, 0);
            const yProfit = chunk.reduce((s, r) => s + r.profit, 0);
            const yLoss = chunk.reduce((s, r) => s + r.loss, 0);
            const yPrincipal = chunk.reduce((s, r) => s + r.principal, 0);
            const yInterest = chunk.reduce((s, r) => s + r.interest, 0);
            const lastBalance = chunk[chunk.length - 1].balance;
            const lastLoanPool = chunk[chunk.length - 1].loanPoolBalance;

            yearly.push({
                month: i + 1, // Year number
                emi: yEmi,
                revenue: yRev,
                cpf: yCpf,
                cgf: yCgf,
                profit: yProfit,
                loss: yLoss,
                principal: yPrincipal,
                interest: yInterest,
                balance: lastBalance, // Balance at end of year
                loanPoolBalance: lastLoanPool,
                totalPayment: yEmi + yCpf + yCgf,
                debitFromBalance: chunk.reduce((s, r) => s + (r.emiFromLoanPool + r.cpfFromLoanPool + r.cgfFromLoanPool), 0),
                netCash: yProfit - yLoss
            });
        }
        setYearlySchedule(yearly);

    }, [amount, rate, months, units, cpfEnabled, cgfEnabled]);

    // --- ACF Derived Data ---
    const acfMonthlyInstallment = useMemo(() => {
        return acfTenureMonths === 11 ? ACF_INSTALLMENT_11_MONTHS : ACF_INSTALLMENT_30_MONTHS;
    }, [acfTenureMonths]);

    const acfTotalInvestment = useMemo(() => {
        return acfUnits * acfMonthlyInstallment * acfTenureMonths;
    }, [acfUnits, acfMonthlyInstallment, acfTenureMonths]);

    const acfCpfBenefit = useMemo(() => {
        // 11 Months: 1 buffalo free (multiplier 1)
        // 30 Months: 2 buffalo free (multiplier 2)
        const multiplier = acfTenureMonths === 11 ? 1 : 2;
        return acfUnits * CPF_PER_UNIT_YEARLY * multiplier;
    }, [acfUnits, acfTenureMonths]);

    const acfMarketAssetValue = acfUnits * MARKET_UNIT_VALUE;
    const acfTotalBenefit = (acfMarketAssetValue - acfTotalInvestment) + acfCpfBenefit;

    const acfScheduleTotal = useMemo(() => {
        const rows: AcfRow[] = [];
        let cumulative = 0;
        const monthly = acfUnits * acfMonthlyInstallment;
        for (let i = 1; i <= acfTenureMonths; i++) {
            cumulative += monthly;
            rows.push({
                month: i,
                installment: monthly,
                cumulative
            })
        }
        return rows;
    }, [acfUnits, acfMonthlyInstallment, acfTenureMonths]);

    return (
        <EmiContext.Provider value={{
            // EMI State
            amount, setAmount,
            rate, setRate,
            months, setMonths,
            units, setUnits,
            cpfEnabled, setCpfEnabled,
            cgfEnabled, setCgfEnabled,

            // EMI Results
            schedule, yearlySchedule,
            emi, totalPayment, totalInterest,
            totalRevenue, totalCpf, totalCgf,
            totalProfit, totalLoss, totalNetCash,
            totalAssetValue,
            simulateHerd,
            calculateAssetValueFromSimulation,
            calculateProjectedAssetValue, // Export new function

            // ACF State
            acfUnits, setAcfUnits,
            acfTenureMonths, setAcfTenureMonths,
            acfProjectionYear, setAcfProjectionYear,
            acfRevenueProjectionYear, setAcfRevenueProjectionYear,

            // ACF Results
            acfMonthlyInstallment,
            acfTotalInvestment,
            acfTotalBenefit,
            acfCpfBenefit,
            acfSchedule: acfScheduleTotal,

            // Utils
            formatCurrency
        }}>
            {children}
        </EmiContext.Provider>
    );
};
