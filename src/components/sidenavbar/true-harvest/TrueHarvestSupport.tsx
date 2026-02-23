import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

const FAQS: FAQ[] = [
    {
        question: 'How do I create an account?',
        answer: 'Download the app, enter your mobile number, verify with OTP, and add your delivery address.',
    },
    {
        question: 'Is True Harvest available in my area?',
        answer: "Enter your pincode in the app to check. We're expanding to new areas regularly.",
    },
    {
        question: 'What products do you offer?',
        answer:
            'We offer a range of fresh products:\n\n' +
            '• Fresh Milk (cow, buffalo, toned, full cream)\n' +
            '• Fresh Curd (plain, sweetened)\n' +
            '• Fresh Fruits (seasonal)\n' +
            '• Fresh Sprouts (moong, mixed, chickpea)',
    },
    {
        question: "What's the minimum order value?",
        answer: 'No minimum for subscriptions. ₹50 minimum for one-time orders.',
    },
    {
        question: 'How do I start a subscription?',
        answer: 'Go to product → Subscribe → Choose frequency (daily/alternate/weekly) → Confirm.',
    },
    {
        question: 'Can I modify my subscription?',
        answer: 'Yes! Change quantity, frequency, pause, or skip dates anytime before 9 PM cutoff.',
    },
    {
        question: 'How do I pause/cancel?',
        answer: 'Menu → My Subscriptions → Select subscription → Pause/Cancel.',
    },
    {
        question: 'Delivery timings?',
        answer: 'Milk & Dairy: 5-8 AM | Other products: 6-10 AM',
    },
    {
        question: "What if I'm not home?",
        answer: "We'll leave it at your doorstep or as per your delivery instructions.",
    },
    {
        question: 'Can I change my address?',
        answer: 'Menu → Manage Addresses → Add/edit addresses.',
    },
    {
        question: 'Payment methods?',
        answer: 'Cash on Delivery (COD) only. Digital payments coming soon.',
    },
    {
        question: "What if I don't have exact change?",
        answer: 'Delivery partners carry change, but exact amount helps.',
    },
    {
        question: 'Return policy?',
        answer: "Perishable items can't be returned. Report damaged/wrong items within 24 hours via app.",
    },
    {
        question: 'How do I report an issue?',
        answer: 'My Orders → Select order → Report Issue → Add photos → Submit.',
    },
    {
        question: 'Refund process?',
        answer: 'Cash refund on next delivery or bill adjustment (24-48 hours).',
    },
    {
        question: 'How do I use a promo code?',
        answer: 'Cart → Checkout → Apply Coupon → Enter code → Apply.',
    },
    {
        question: 'Referral program?',
        answer: 'Menu → Refer & Earn → Share your code. Both get rewards!',
    },
    {
        question: 'App not working?',
        answer: 'Check internet → Force close app → Clear cache → Update app → Restart phone.',
    },
    {
        question: 'Not receiving OTP?',
        answer: 'Check network → Wait 2 minutes → Resend OTP → Contact support if still not received.',
    },
];

const FAQItem: React.FC<{ item: FAQ }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    const renderContent = (text: string) => {
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];
        let keyCounter = 0;

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${keyCounter++}`} className="list-disc pl-5 mt-2 space-y-1">
                        {listItems.map((li, idx) => (
                            <li key={idx} className="text-gray-600">
                                {li.substring(1).trim()}
                            </li>
                        ))}
                    </ul>
                );
                listItems = [];
            }
        };

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('•')) {
                listItems.push(trimmed);
            } else {
                flushList();
                if (trimmed) {
                    elements.push(
                        <p key={`p-${keyCounter++}`} className="mt-2 text-gray-600">
                            {trimmed}
                        </p>
                    );
                }
            }
        });
        flushList();

        return elements;
    };

    return (
        <div
            className={`bg-white rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 ${isOpen ? 'shadow-md mb-4' : 'hover:shadow-sm mb-2'}`}
        >
            <div
                className="flex justify-between items-center p-5 cursor-pointer bg-white hover:bg-gray-50 transition-colors gap-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-gray-800 text-lg">{item.question}</span>
                {isOpen ? <ChevronUp className="text-teal-600 flex-shrink-0" size={24} /> : <ChevronDown className="text-gray-400 flex-shrink-0" size={24} />}
            </div>

            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="p-6 pt-2 border-t border-gray-100 bg-gray-50/50">
                    <div className="mb-4">{renderContent(item.answer)}</div>
                </div>
            </div>
        </div>
    );
};

const TrueHarvestSupport: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Support form submitted:', formData);
        alert('Thank you for contacting support! We will get back to you shortly.');
        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: ''
        });
    };

    return (
        <div className="min-h-screen bg-[#f3f6fc] text-gray-900 font-['Inter'] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-2xl">
                <h1 className="text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">Contact Support</h1>
                <p className="text-lg text-gray-600">We are here to help. Check our FAQs below or fill out the form to get in touch with our team.</p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* FAQ Section */}
                <div className="w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-8 bg-teal-600 rounded-full"></span>
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <FAQItem key={index} item={faq} />
                        ))}
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">How can we help you?</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                                placeholder="Describe your issue or question..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#238E8B] hover:bg-[#1b726f] text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TrueHarvestSupport;
