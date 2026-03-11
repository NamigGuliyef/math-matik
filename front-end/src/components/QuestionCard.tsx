import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, Target } from 'lucide-react';

interface Question {
    _id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    level: string;
    rewardAmount: number;
}

interface QuestionCardProps {
    question: Question;
    onAnswer: (isCorrect: boolean, selectedAnswer: string) => void;
    stage?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, stage }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        const validOptions = question.options.filter(opt => opt !== undefined && opt !== null && String(opt).trim() !== '' && String(opt).toLowerCase() !== 'undefined' && String(opt).toLowerCase() !== 'null');
        setSelectedOption(index);
        setIsAnswered(true);
        const selectedValue = validOptions[index];
        setTimeout(() => {
            onAnswer(selectedValue === question.correctAnswer, selectedValue);
            setSelectedOption(null);
            setIsAnswered(false);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card"
            style={{ padding: '1.5rem', width: '100%', maxWidth: '700px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={15} /> {question.level.toUpperCase()} {stage && `| Mərhələ ${stage}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                    <Zap size={15} /> +{question.rewardAmount} AZN
                </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>{question.text}</h3>

            <div style={{ display: 'grid', gap: '0.8rem' }}>
                {question.options
                    .filter(opt => opt !== undefined && opt !== null && String(opt).trim() !== '' && String(opt).toLowerCase() !== 'undefined' && String(opt).toLowerCase() !== 'null')
                    .map((option, index, filteredOptions) => {
                        let style: React.CSSProperties = {
                            padding: '1rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.03)',
                            cursor: isAnswered ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left',
                            fontSize: '1rem',
                            fontWeight: 500,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: 'white'
                        };

                        if (isAnswered) {
                            const isCorrectSelection = filteredOptions[selectedOption!] === question.correctAnswer;
                            if (option === question.correctAnswer && isCorrectSelection) {
                                style.borderColor = 'var(--success)';
                                style.background = 'rgba(34, 197, 94, 0.1)';
                                style.color = 'var(--success)';
                            } else if (index === selectedOption && !isCorrectSelection) {
                                style.borderColor = 'var(--error)';
                                style.background = 'rgba(239, 68, 68, 0.1)';
                                style.color = 'var(--error)';
                            }
                        }

                        return (
                            <motion.button
                                key={index}
                                style={style}
                                whileHover={!isAnswered ? { scale: 1.02, background: 'rgba(255,255,255,0.1)', borderColor: 'var(--primary)' } : {}}
                                onClick={() => handleOptionClick(index)} // index here refers to the filtered list index
                                disabled={isAnswered}
                            >
                                {option}
                                {isAnswered && option === question.correctAnswer && filteredOptions[selectedOption!] === question.correctAnswer && <CheckCircle2 size={20} />}
                                {isAnswered && index === selectedOption && option !== question.correctAnswer && <XCircle size={20} />}
                            </motion.button>
                        );
                    })}
            </div>
        </motion.div>
    );
};

export default QuestionCard;
