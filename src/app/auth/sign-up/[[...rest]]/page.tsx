import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-beige py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-dark-green-600">
            Join Second Turn Games
          </h2>
          <p className="mt-2 text-sm text-dark-green-500">
            Create your account to start buying and selling board games
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-strong p-8">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-vibrant-orange-500 hover:bg-vibrant-orange-600 text-white',
                card: 'shadow-none',
                headerTitle: 'text-dark-green-600 font-display',
                headerSubtitle: 'text-dark-green-500',
                socialButtonsBlockButton: 'border-dark-green-200 hover:bg-light-beige-50',
                formFieldInput: 'border-dark-green-200 focus:border-vibrant-orange-500 focus:ring-vibrant-orange-500',
                footerActionLink: 'text-vibrant-orange-500 hover:text-vibrant-orange-600'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
