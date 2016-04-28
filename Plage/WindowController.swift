
//
//  WindowController.swift
//  Plage
//
//  Created by them on 4/26/16.
//  Copyright © 2016 them. All rights reserved.
//

import Cocoa

class WindowController: NSPanel {
    @IBOutlet var searchField: NSTextField!
    @IBOutlet var progressBar: NSProgressIndicator!
    @IBOutlet var outputField: NSTextView!
    @IBOutlet var usernameField: NSTextField!
    @IBOutlet var passwordField: NSTextField!
    @IBOutlet var analysisOutputField: NSTextView!
    var observationObject: NSObjectProtocol!
    var analysisObservationObject: NSObjectProtocol!
    var totalPosts: Int! = Int(1)
    var currentPostIndex: Int! = Int(0)
    
    override func awakeFromNib() {
        progressBar.doubleValue = 100
        outputField.textColor = NSColor.whiteColor()
        log("Awaiting URL...\n")
//        searchField.target = self
//        searchField.action = #selector(WindowController.submitSearch(_:))
    }
    
    @IBAction func submitSearch(sender: AnyObject) {
        let pathToScript = NSBundle.mainBundle().URLForResource("crawl", withExtension: "js")?.path
        Swift.print("Going to: \(searchField.stringValue)")
        let scriptIOHandle = shell("/usr/local/bin/node",pathToScript!,searchField.stringValue,usernameField.stringValue,passwordField.stringValue) as! NSPipe
        scriptIOHandle.fileHandleForReading.waitForDataInBackgroundAndNotify()
        observationObject = writeToLog(scriptIOHandle)
//        let scriptIOHandle = shell("pwd") as! NSPipe
//        scriptIOHandle.fileHandleForReading.waitForDataInBackgroundAndNotify()
//        observationObject = writeToLog(scriptIOHandle)
    }
    
    @IBAction func analyze(sender: AnyObject) {
        let pathToScript = NSBundle.mainBundle().URLForResource("sentiment", withExtension: "js")?.path
        let scriptIOHandle = shell("/usr/local/bin/node",pathToScript!) as! NSPipe
        scriptIOHandle.fileHandleForReading.waitForDataInBackgroundAndNotify()
        analysisObservationObject = writeToAnalysisLog(scriptIOHandle)
    }
    
    func shell(args: String...) -> AnyObject {
        let task = NSTask()
        task.launchPath = "/usr/bin/env"
        task.arguments = args
        let pipe = NSPipe()
        task.standardOutput = pipe
        
        var rawEnvironment = NSProcessInfo.processInfo().environment
        let pathToChromeDriver = (NSBundle.mainBundle().URLForResource("chromedriver", withExtension: "")?.path as NSString!).stringByDeletingLastPathComponent
        rawEnvironment["PATH"] = "\(rawEnvironment["PATH"]!):\(pathToChromeDriver)"
        task.environment = rawEnvironment
        
        task.launch()
        return pipe
    }
    
    func log(string: String) {
        if string.containsString("crawling:") {
            currentPostIndex = Int((string.substringFromIndex(string.startIndex.advancedBy(9)) as NSString).intValue)
            progressBar.doubleValue = Double(currentPostIndex)/Double(totalPosts)*100.0
            outputField.textStorage?.appendAttributedString(NSAttributedString(string: string))
        }
        if string.containsString("total:") {
            totalPosts = Int((string.substringFromIndex(string.startIndex.advancedBy(6)) as NSString).intValue)
            progressBar.doubleValue = Double(currentPostIndex)/Double(totalPosts)*100.0
            outputField.textStorage?.appendAttributedString(NSAttributedString(string: string))
        }
        if string.containsString("DONE.") && currentPostIndex < totalPosts {
            submitSearch("none")
            outputField.textStorage?.appendAttributedString(NSAttributedString(string: "Login/alert hiccup, restarting..."))
        } else {
            outputField.textStorage?.appendAttributedString(NSAttributedString(string: string))
        }
        Swift.print(progressBar.doubleValue)
        outputField.scrollRangeToVisible(NSMakeRange(outputField.textStorage!.length,0))
    }
    
    func analysisLog(string: String) {
        analysisOutputField.textStorage?.appendAttributedString(NSAttributedString(string: string))
        analysisOutputField.scrollRangeToVisible(NSMakeRange(analysisOutputField.textStorage!.length,0))
    }
    
    func writeToLog(pipe: NSPipe) -> NSObjectProtocol {
        var obs1 : NSObjectProtocol!
        obs1 = NSNotificationCenter.defaultCenter().addObserverForName(NSFileHandleDataAvailableNotification,
           object: pipe.fileHandleForReading, queue: nil) {  notification -> Void in
            let data = pipe.fileHandleForReading.availableData
            if data.length > 0 {
                if let str = NSString(data: data, encoding: NSUTF8StringEncoding) {
                    self.log(str as String)
                }
                pipe.fileHandleForReading.waitForDataInBackgroundAndNotify()
            } else {
                self.log("DONE.")
                NSNotificationCenter.defaultCenter().removeObserver(obs1)
            }
        }
        return obs1
    }
    
    func writeToAnalysisLog(pipe: NSPipe) -> NSObjectProtocol {
        var obs1 : NSObjectProtocol!
        obs1 = NSNotificationCenter.defaultCenter().addObserverForName(NSFileHandleDataAvailableNotification,
           object: pipe.fileHandleForReading, queue: nil) {  notification -> Void in
            let data = pipe.fileHandleForReading.availableData
            if data.length > 0 {
                if let str = NSString(data: data, encoding: NSUTF8StringEncoding) {
                    self.analysisLog(str as String)
                }
                pipe.fileHandleForReading.waitForDataInBackgroundAndNotify()
            } else {
                self.analysisLog("DONE.")
                NSNotificationCenter.defaultCenter().removeObserver(obs1)
            }
        }
        return obs1
    }
}