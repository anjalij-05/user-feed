import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CircleCheck, CircleX, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { domain } from '@/constants';

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        phone: '',
        email: '',
        message: '',
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (
            !formData.name ||
            !formData.subject ||
            !formData.phone ||
            !formData.email ||
            !formData.message
        ) {
            toast('Please fill in all required fields', {
                className:
                    '!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2',
                icon: <CircleX className="size-5" />,
            });
            return;
        }

        try {
            const response = await axios.post(`${domain}/api/contact-us`, formData, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.data.status === 422) {
                toast(response.data.error.email, {
                    className: '!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2',
                    icon: <CircleX className="size-5" />,
                });
            }

            if (response.data.status === 200) {
                setFormData({
                    name: '',
                    subject: '',
                    phone: '',
                    email: '',
                    message: '',
                });
                toast(response.data.message || 'Message sent successfully', {
                    className: '!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2',
                    icon: <CircleCheck className="size-5" />,
                });
            }
        } catch (error) {
            toast('Failed to send message', {
                className: '!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2',
                icon: <CircleX className="size-5" />,
            });
        }
    };

    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
            <div className="container">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12 lg:mb-16">
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have questions about event management? We're here to help you create unforgettable events.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Side - Contact Information */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                                    Let's Connect
                                </h3>
                                <p className="text-base sm:text-lg text-muted-foreground">
                                    Whether you're planning your first event or looking to enhance your event management experience, 
                                    our team is ready to assist you. Reach out to us through any of the channels below.
                                </p>
                            </div>

                            {/* Contact Cards */}
                            <div className="flex flex-col gap-6">
                                {/* Phone */}
                                <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <Phone className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1">Phone</h4>
                                            <p className="text-muted-foreground text-sm">Give us a call</p>
                                            <a
                                                href="tel:+919643314331"
                                                className="text-primary font-semibold hover:underline mt-2 block"
                                            >
                                                +91 96433 14331
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <Mail className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1">Email</h4>
                                            <p className="text-muted-foreground text-sm">Send us a message</p>
                                            <a
                                                href="mailto:value@klout.club"
                                                className="text-primary font-semibold hover:underline mt-2 block break-all"
                                            >
                                                value@klout.club
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Office Hours */}
                                <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <MapPin className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1">Office Hours</h4>
                                            <p className="text-muted-foreground text-sm">Monday - Friday</p>
                                            <p className="text-foreground font-semibold mt-2">
                                                9:00 AM - 6:00 PM IST
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-8 border">
                            <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
                                Send Us a Message
                            </h3>
                            <p className="text-muted-foreground text-center mb-6">
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Subject Field */}
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="h-12"
                                        placeholder="Enter subject"
                                    />
                                </div>

                                {/* Message Field - Full Width */}
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="message" className="block text-sm font-medium text-foreground">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder="Tell us how we can help you..."
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full mt-6 h-12 text-base font-semibold"
                                size="lg"
                            >
                                Send Message
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;

