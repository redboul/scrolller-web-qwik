//import buffer from "buffer";

export const encodedList = [
  'd2V0aW5zbG93bW90aW9u',
  'c2xvbW9wdXNzeXB1bXA=',
  'RmluZ2VyaW5n',
  'ZGlsZG8=',
  'Z2lybHNtYXN0dXJiYXRpbmc=',
  'UE9WX2Nvd2dpcmw=',
  'UmV2ZXJzZUNvd2dpcmxQbG93Q2Ft',
  'UHVzc3lUcmVhc3VyeQ==',
  'Z2V0dGluZ2hlcnNlbGZvZmY=',
  'UGVlYW5kU3F1aXJ0R0lGcw==',
  'Q2xvc2VVcF9TZXg=',
  'Z3Jvb2w=',
  'RlRWX0dJRlM='
];

export function prettyPrintList() {
 //console.log(encodedList.map(item => buffer.Buffer.from(item).toString('base64')));
  return encodedList.map((item) => atob(item));
}

//prettyPrintList();