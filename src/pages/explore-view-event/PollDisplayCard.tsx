import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { BarChart3, CircleCheck, CircleX, Clock } from 'lucide-react';
import useGamificationStore from '@/store/gamificationStore';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';

interface PollDisplayCardProps {
    eventUuid: string;
    organiserUuid: string;
    isLive: boolean;
}

interface PollQuestion {
    _id: string;
    eventUUID: string;
    userUUID: string;
    question: string;
    scheduleDateTime: string;
    duration: number;
    options: string[];
    type: 'poll' | 'wordCloud';
}

interface ActivePollState {
    poll: PollQuestion;
    timeRemaining: number;
    totalDuration: number;
    selectedOption: string;
}

const PollDisplayCard: React.FC<PollDisplayCardProps> = ({ eventUuid, organiserUuid, isLive }) => {
    const { getPollQuestions } = useGamificationStore((state: any) => state);
    const [activePolls, setActivePolls] = useState<ActivePollState[]>([]);
    const { user } = useAppSelector((state) => state.auth);
    const { submitPoll } = useGamificationStore(state => state);

    useEffect(() => {
        if (eventUuid && organiserUuid && isLive) {
            fetchPolls();
        }
    }, [eventUuid, organiserUuid, isLive]);

    const fetchPolls = async () => {
        try {
            const res = await getPollQuestions(organiserUuid, eventUuid);
            if (res && res.data) {
                findActivePoll(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch polls", error);
        }
    };

    const findActivePoll = (polls: PollQuestion[]) => {
        const now = new Date().getTime();

        // Find all currently active polls
        const currentPolls = polls.filter(poll => {
            const startTime = new Date(poll.scheduleDateTime).getTime();
            const durationMs = poll.duration * 60 * 1000;
            const endTime = startTime + durationMs;

            return now >= startTime && now < endTime;
        });

        if (currentPolls.length > 0) {
            // Create state for each active poll
            const activePollStates: ActivePollState[] = currentPolls.map(poll => {
                const startTime = new Date(poll.scheduleDateTime).getTime();
                const durationMs = poll.duration * 60 * 1000;
                const endTime = startTime + durationMs;
                const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

                // Check if this poll already exists in state to preserve selected option
                const existingPoll = activePolls.find(ap => ap.poll._id === poll._id);

                return {
                    poll,
                    timeRemaining: remaining,
                    totalDuration: poll.duration * 60,
                    selectedOption: existingPoll?.selectedOption || "",
                };
            });

            setActivePolls(activePollStates);
        } else {
            setActivePolls([]);
        }
    };

    useEffect(() => {
        if (activePolls.length === 0) return;

        const interval = setInterval(() => {
            setActivePolls(prevPolls => {
                return prevPolls
                    .map(pollState => ({
                        ...pollState,
                        timeRemaining: Math.max(0, pollState.timeRemaining - 1),
                    }))
                    .filter(pollState => pollState.timeRemaining > 0); // Remove expired polls
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [activePolls.length]);

    // Re-check for new polls every minute
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (eventUuid && organiserUuid && isLive) {
                fetchPolls();
            }
        }, 60000);

        return () => clearInterval(checkInterval);
    }, [eventUuid, organiserUuid, isLive]);


    if (activePolls.length === 0) return null;

    const handleVote = async (pollId: string, selectedOption: string) => {
        if (!user) {
            toast("Please login to vote", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!selectedOption) {
            toast.error("Please select an option");
            return;
        }

        const data = {
            mobileNumber: user?.mobileNumber,
            answer: selectedOption,
            eventUUID: eventUuid
        };

        const response = await submitPoll(pollId, data);

        if (response.status) {
            toast(response.message || "Vote Submitted Successfully", {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className='size-5' />
            });

            // Clear the selected option after successful submission
            setActivePolls(prevPolls =>
                prevPolls.map(p =>
                    p.poll._id === pollId ? { ...p, selectedOption: "" } : p
                )
            );
        } else {
            toast(response.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    const handleOptionChange = (pollId: string, value: string) => {
        setActivePolls(prevPolls =>
            prevPolls.map(p =>
                p.poll._id === pollId ? { ...p, selectedOption: value } : p
            )
        );
    };

    return (
        <>
            {activePolls.map((pollState, index) => {
                const { poll, timeRemaining, totalDuration, selectedOption } = pollState;
                const progressPercentage = ((totalDuration - timeRemaining) / totalDuration) * 100;

                return (
                    <Card
                        key={poll._id}
                        className="w-full border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6"
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                                        Live Poll {activePolls.length > 1 ? `(${index + 1}/${activePolls.length})` : ''}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-mono bg-background/80 px-2 py-1 rounded border">
                                    <Clock className="size-3" />
                                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                </div>
                            </div>
                            <Progress value={progressPercentage} className="h-1 mt-2" />
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold leading-tight">
                                    {poll.question}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <BarChart3 className="size-4" />
                                    {poll.type === 'wordCloud' ? 'Word Cloud' : 'Single Choice'}
                                </p>
                            </div>

                            {poll.type === 'poll' ? (
                                <RadioGroup
                                    value={selectedOption}
                                    onValueChange={(value) => handleOptionChange(poll._id, value)}
                                    className="space-y-3"
                                >
                                    {poll.options.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            className={`flex items-center space-x-2 border rounded-lg p-3 transition-all hover:bg-accent/50 ${selectedOption === option ? 'border-primary bg-primary/5' : 'border-border'}`}
                                        >
                                            <RadioGroupItem value={option} id={`poll-${poll._id}-option-${optIndex}`} />
                                            <Label htmlFor={`poll-${poll._id}-option-${optIndex}`} className="flex-1 cursor-pointer font-medium">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <div className="space-y-3">
                                    <Label>Your Answer</Label>
                                    <Input
                                        placeholder="Type your answer here..."
                                        value={selectedOption}
                                        onChange={(e) => handleOptionChange(poll._id, e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                            )}

                            <Button
                                onClick={() => handleVote(poll._id, selectedOption)}
                                className="w-full font-semibold"
                                disabled={!selectedOption}
                            >
                                Submit {poll.type === 'wordCloud' ? 'Answer' : 'Vote'}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </>
    );
};

export default PollDisplayCard;
