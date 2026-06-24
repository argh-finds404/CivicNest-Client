import React from'react';
import CommunityVerifyFeed from'./CommunityVerifyFeed';
import BackButton from'../common/BackButton';

export default function StandaloneVerifyFeedPage() {
 return (
 <div className="min-h-screen pt-28 pb-20 px-[5%]"style={{ fontFamily:"'Outfit', sans-serif"}}>
 <div className="max-w-5xl mx-auto">
 <div className="mb-4">
 <BackButton variant="dark" />
 </div>
 
 <div className="mb-8">
 <h1 className="text-4xl tracking-tight font-extrabold bg-gradient-to-r from-[#40826D] to-[#204d40] dark:from-[#9FE2BF] dark:to-[#40826D] bg-clip-text text-transparent mb-2 inline-block tracking-tight">
 Needs Verification
 </h1>
 <p className="text-slate-650 font-medium text-[13px]">
 Confirm resolved civic issues reported by neighbours to help keep our database honest and claim points rewards!
 </p>
 </div>

 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-xl p-4 md:p-5 shadow-sm">
 <CommunityVerifyFeed />
 </div>
 </div>
 </div>
 );
}
