import * as React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * UTILITY: Local replacement for 'cn' to avoid import errors
 */
const cn = (...classes) => classes.filter(Boolean).join(" ");

/**
 * INTEGRATED BUTTON COMPONENT
 */
const buttonVariants = (options) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ";
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-500 text-white hover:bg-red-600 border border-red-400",
    outline: "bg-background hover:bg-accent hover:text-accent-foreground border border-gray-200 text-gray-700",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-gray-100 text-gray-600",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return cn(baseStyles, variantStyles[options?.variant || "default"], sizeStyles[options?.size || "default"]);
};

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

/**
 * INTEGRATED CARD COMPONENTS
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg bg-white text-card-foreground w-full border border-gray-300 shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * MAIN PAGE COMPONENT
 */
const StudentEntry = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="p-2 text-center">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">STUDENT PORTAL</h2>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Choose an option to continue</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="default" 
                className="w-full py-6 font-bold uppercase tracking-widest"
                onClick={() => navigate('/student/login')}
              >
                Login to Account
              </Button>
              <Button 
                variant="outline" 
                className="w-full py-6 font-bold uppercase tracking-widest"
                onClick={() => navigate('/student/register')}
              >
                Create New Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full font-bold uppercase tracking-widest"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentEntry;