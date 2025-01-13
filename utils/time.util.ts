export const parseDuration = (durationStr: string): number => {
   if (typeof durationStr === 'string' && /^[0-9]+s$/.test(durationStr)) {
      return parseInt(durationStr.slice(0, -1), 10)
   } else {
      throw new Error(
         "Invalid duration format. Expected a string ending with 's'.",
      )
   }
}
