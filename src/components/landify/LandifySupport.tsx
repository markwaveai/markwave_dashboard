import React, { useState } from 'react';
import '../Support/Support.css';
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
        <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="faq-question">
                <span>{item.question}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            <div className={`faq-answer ${isOpen ? 'show' : ''}`}>
                <p>{item.answer}</p>
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
        <div className="support-container">
            <div className="support-header">
                <h1>Landify Support</h1>
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

export default LandifySupport;
