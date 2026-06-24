import React from'react';

export default function AttendeeAvatarStack({ attendees = [], max = 4, size ='sm'}) {
 const visible = attendees.slice(0, max);
 const overflow = attendees.length > max ? attendees.length - max : 0;

 const sizeClass =
 size ==='xs'?'w-6 h-6 text-[10px]':
 size ==='sm'?'w-7 h-7 text-xs':'w-9 h-9 text-[13px]';

 return (
 <div className="flex items-center">
 <div className="flex -space-x-2">
 {visible.map((att, i) => {
 const displayName = att.name && att.name.includes('@') ? att.name.split('@')[0] : (att.name ||'Attendee');
 return att.photoURL || att.profileImg ? (
 <img
 key={i}
 src={att.photoURL || att.profileImg}
 alt={displayName}
 title={displayName}
 className={`${sizeClass} rounded-full border-2 border-white object-cover`}
 />
 ) : (
 <div
 key={i}
 title={displayName}
 className={`${sizeClass} rounded-full border-2 border-white bg-teal-600 flex items-center justify-center text-white font-bold`}
 >
 {displayName[0].toUpperCase()}
 </div>
 );
 })}
 {overflow > 0 && (
 <div className={`${sizeClass} rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 dark:text-slate-300 font-semibold`}>
 +{overflow}
 </div>
 )}
 </div>
 </div>
 );
}
