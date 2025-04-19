import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Appointment } from '@/app/appointments/page';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  Clock, 
  CalendarX, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onCancel: (id: number) => Promise<void>;
  onSubmitFeedback: (id: number, feedback: string) => Promise<void>;
}

export function AppointmentDetails({ 
  appointment, 
  onClose, 
  onCancel, 
  onSubmitFeedback 
}: AppointmentDetailsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState(appointment.student_feedback || '');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Format the appointment date
  const formattedDate = format(
    new Date(appointment.date), 
    'EEEE, MMMM d, yyyy'
  );

  // Check if the appointment can be cancelled
  // Only upcoming appointments that are not cancelled can be cancelled
  const canCancel = ['requested', 'confirmed'].includes(appointment.status);

  // Check if feedback can be submitted
  // Only completed appointments can receive feedback
  const canSubmitFeedback = appointment.status === 'completed';

  // Handle cancelling appointment
  const handleCancelAppointment = async () => {
    setIsCancelling(true);
    try {
      await onCancel(appointment.id);
      setShowCancelDialog(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle submitting feedback
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    
    setIsSubmittingFeedback(true);
    try {
      await onSubmitFeedback(appointment.id, feedback);
      setShowFeedbackDialog(false);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Get status badge styles
  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'requested':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
            <CalendarX className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <div className={cn(
            "py-3 px-6",
            appointment.status === 'confirmed' ? "bg-primary/10" :
            appointment.status === 'requested' ? "bg-yellow-100 dark:bg-yellow-900/30" :
            appointment.status === 'completed' ? "bg-green-100 dark:bg-green-900/30" :
            "bg-gray-100 dark:bg-gray-800"
          )}>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{appointment.title}</DialogTitle>
              {getStatusBadge()}
            </div>
            <DialogDescription className="mt-1">
              {appointment.type}
            </DialogDescription>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes & Feedback</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="pt-2 pb-6 px-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.start_time} - {appointment.end_time}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center">
                  <User className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="font-medium">Counsellor</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.counsellor_name}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="font-medium">Appointment Type</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.type}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {appointment.status}
                    </p>
                  </div>
                </div>

                {appointment.status === 'cancelled' && (
                  <>
                    <Separator />
                    <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md text-sm">
                      <p className="font-medium">This appointment has been cancelled.</p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="pt-2 pb-6 px-6">
              <div className="space-y-4">
                {appointment.notes && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Your Notes</h3>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        {appointment.notes}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {appointment.counsellor_notes && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Counsellor Notes</h3>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        {appointment.counsellor_notes}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {appointment.student_feedback ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Feedback</h3>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      {appointment.student_feedback}
                    </div>
                  </div>
                ) : canSubmitFeedback ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Provide Feedback</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Share your thoughts about this appointment to help us improve our services.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFeedbackDialog(true)}
                      className="w-full"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Feedback
                    </Button>
                  </div>
                ) : null}

                {!appointment.notes && !appointment.counsellor_notes && !appointment.student_feedback && !canSubmitFeedback && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No notes or feedback available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              
              {canCancel && (
                <Button 
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <CalendarX className="mr-2 h-4 w-4" />
                  Cancel Appointment
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelAppointment}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Please share your thoughts about this appointment. Your feedback helps us improve our counselling services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Write your feedback here..."
              className="min-h-[150px]"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowFeedbackDialog(false)}
              disabled={isSubmittingFeedback}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={!feedback.trim() || isSubmittingFeedback}
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
