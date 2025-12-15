// // app/recoil-provider.tsx
// 'use client';

// import errorState from '@/store/atoms/error';
// import { useState } from 'react';
// import { RecoilRoot, useRecoilValue } from 'recoil';

// export default function RecoilProvider({ children }: { children: React.ReactNode }) {
//   const error = useRecoilValue(errorState)
//   return <RecoilRoot>
//     {
//       error && (
//         <div className="one">error: {error}</div>
//       )
//     }
//     {children}
//   </RecoilRoot>;
// }


'use client';

import errorState from '@/store/atoms/error';
import { RecoilRoot, useRecoilValue } from 'recoil';

export default function RecoilProvider({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      {children}
    </RecoilRoot>
  );
}
