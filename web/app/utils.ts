import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {Params} from "@remix-run/react";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function requireParam(param: string, params: Params){
  const val = params[param]
  if(!val){
    throw new Error(`${param} is a required route parameter`)
  }
  return val;

}

export function requireResult<T>(res: T | undefined){
  if(!res){
    throw new Error("This function expects a result")
  }
  return res;

}