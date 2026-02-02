import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

const FAQS: FAQ[] = [
    {
        question: 'How much fodder does the Kurnool farm require annually?',
        answer: 'The Kurnool farm requires approximately 215,625 tons of fodder per year, including a safety buffer.',
    },
    {
        question: 'Which regions supply fodder to the Kurnool farm?',
        answer: 'Fodder is sourced from Adoni, Veldurthi, and Krishnagiri regions.',
    },
    {
        question: 'How much land is required to meet the fodder demand?',
        answer: 'Approximately 2,160 acres of farmland are required annually.',
    },
    {
        question: 'How many agents are involved in the operation?',
        answer: 'A total of 12 field agents manage procurement and coordination.',
    },
    {
        question: 'How many farmers typically work with one agent?',
        answer: 'Each agent coordinates with 35 to 40 farmers, depending on landholding size.',
    },
    {
        question: 'What is the average daily fodder intake of the farm?',
        answer: 'The farm receives approximately 590 tons of fodder per day.',
    },
    {
        question: 'How is fodder transported?',
        answer: 'Transportation is done using tractors and trolleys with an average capacity of 10 tons per trip, totaling about 60 trips per day.',
    },
    {
        question: 'Is fodder quality checked before acceptance?',
        answer: 'Yes. All fodder undergoes quality checks for moisture, freshness, and contamination before acceptance.',
    },
    {
        question: 'How much buffer stock is maintained?',
        answer: 'The farm maintains a rolling buffer of 15 days, equivalent to 8,800–9,000 tons of fodder.',
    },
    {
        question: 'What happens if fodder quality does not meet standards?',
        answer: 'Fodder that fails quality checks may be rejected and will not be eligible for payment.',
    },
];

const FAQItem: React.FC<{ item: FAQ }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

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
                    <p className="mb-4 text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

const LandifySupport: React.FC = () => {
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
        alert('Thank you for contacting Landify support! We will get back to you shortly.');
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
                <h1 className="text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">Landify Support</h1>
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

export default LandifySupport;
