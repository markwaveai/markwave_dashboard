import React, { useState } from 'react';
import '../Support/Support.css';
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
                    <ul key={`list-${keyCounter++}`}>
                        {listItems.map((li, idx) => (
                            <li key={idx}>
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
                        <p key={`p-${keyCounter++}`}>
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
        <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                <span>{item.question}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <div className={`faq-answer ${isOpen ? 'show' : ''}`}>
                {renderContent(item.answer)}
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
        <div className="support-container">
            <div className="support-header">
                <h1>Contact Support</h1>
                <p>We are here to help. Check our FAQs or fill out the form below.</p>
            </div>

            <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                    {FAQS.map((faq, index) => (
                        <FAQItem key={index} item={faq} />
                    ))}
                </div>
            </div>

            <div className="support-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-col">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="form-control"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-col">
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="form-control"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">How can we help you?</label>
                        <textarea
                            id="message"
                            name="message"
                            className="form-control"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describe your issue or question..."
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Send Message</button>
                </form>
            </div>
        </div>
    );
};

export default TrueHarvestSupport;
