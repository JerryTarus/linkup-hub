// Client component to render the QR code.
'use client';

// Import the 'qrcode.react' library for easy QR code generation in React.
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Define the props for the Ticket component.
interface TicketProps {
  eventName: string;
  eventDate: string;
  // This is the JSON string we stored in the `rsvps.qr_code_data` column.
  qrCodeData: string; 
}

export default function Ticket({ eventName, eventDate, qrCodeData }: TicketProps) {
  
  // A simple function to format the date for better readability.
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg">
      <CardHeader className="bg-brand-primary text-white">
        <CardTitle>{eventName}</CardTitle>
        <CardDescription className="text-gray-300">{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 bg-brand-bg">
        <div className="p-4 bg-white rounded-lg shadow-inner">
          {/* The QRCodeSVG component takes the data string and renders it as an SVG.
            SVG is used because it's scalable and crisp on all screen resolutions.
            The 'level' prop sets the error correction capability. 'H' (High) is robust.
            The size determines the dimensions of the QR code.
          */}
          <QRCodeSVG 
            value={qrCodeData} 
            size={200} 
            bgColor={"#ffffff"}
            fgColor={"#3A3A3A"}
            level={"H"}
            includeMargin={true}
          />
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Present this QR code at the event entrance for scanning.
        </p>
      </CardContent>
    </Card>
  );
}