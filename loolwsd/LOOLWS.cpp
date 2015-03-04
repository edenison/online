/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/*
 * This file is part of the LibreOffice project.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Parts of this file is covered by:

Boost Software License - Version 1.0 - August 17th, 2003

Permission is hereby granted, free of charge, to any person or organization
obtaining a copy of the software and accompanying documentation covered by
this license (the "Software") to use, reproduce, display, distribute,
execute, and transmit the Software, and to prepare derivative works of the
Software, and to permit third-parties to whom the Software is furnished to
do so, all subject to the following:

The copyright notices in the Software and this entire statement, including
the above license grant, this restriction and the following disclaimer,
must be included in all copies of the Software, in whole or in part, and
all derivative works of the Software, unless such copies or derivative
works are solely in the form of machine-executable object code generated by
a source language processor.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE
FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

 */

#include <unistd.h>
#include <stdlib.h>

#include <iostream>

#define LOK_USE_UNSTABLE_API
#include <LibreOfficeKit/LibreOfficeKitInit.h>

#include <Poco/Format.h>
#include <Poco/Net/HTTPClientSession.h>
#include <Poco/Net/HTTPRequest.h>
#include <Poco/Net/HTTPRequestHandler.h>
#include <Poco/Net/HTTPRequestHandlerFactory.h>
#include <Poco/Net/HTTPServer.h>
#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/Net/NetException.h>
#include <Poco/Net/ServerSocket.h>
#include <Poco/Net/WebSocket.h>
#include <Poco/Util/HelpFormatter.h>
#include <Poco/Util/Option.h>
#include <Poco/Util/OptionSet.h>
#include <Poco/Util/ServerApplication.h>

#include "LOOLConnectionServer.h"

using Poco::Net::HTTPClientSession;
using Poco::Net::HTTPRequest;
using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPRequestHandlerFactory;
using Poco::Net::HTTPResponse;
using Poco::Net::HTTPServer;
using Poco::Net::HTTPServerParams;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;
using Poco::Net::ServerSocket;
using Poco::Net::WebSocket;
using Poco::Net::WebSocketException;
using Poco::Util::Application;
using Poco::Util::HelpFormatter;
using Poco::Util::Option;
using Poco::Util::OptionSet;
using Poco::Util::ServerApplication;
using Poco::Runnable;
using Poco::Thread;

class WebSocketRequestHandler: public HTTPRequestHandler
    /// Handle a WebSocket connection.
{
public:
    WebSocketRequestHandler(LibreOfficeKit *loKit) :
        _loKit(loKit)
    {
    }

    void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response) override
    {
        if(!(request.find("Upgrade") != request.end() && Poco::icompare(request["Upgrade"], "websocket") == 0))
        {
            response.setStatusAndReason(HTTPResponse::HTTP_BAD_REQUEST);
            response.setContentLength(0);
            response.send();
            return;
        }

        Application& app = Application::instance();
        try
        {
            WebSocket ws(request, response);
            app.logger().information("WebSocket connection established.");

#if 0
            int kid = fork();
            if (kid == 0)
#endif
            {
                LOOLConnectionServer *server(new LOOLConnectionServer(ws, _loKit));

                // Loop, receiving LOOL client WebSocket messages
                try
                {
                    int flags;
                    int n;
                    do
                    {
                        char buffer[1024];
                        n = ws.receiveFrame(buffer, sizeof(buffer), flags);
                        app.logger().information(Poco::format("Frame received (length=%d, flags=0x%x).", n, unsigned(flags)));

                        if (n > 0 && (flags & WebSocket::FRAME_OP_BITMASK) != WebSocket::FRAME_OP_CLOSE)
                            server->handleInput(buffer, n);
                    }
                    while (n > 0 && (flags & WebSocket::FRAME_OP_BITMASK) != WebSocket::FRAME_OP_CLOSE);
                    app.logger().information("WebSocket connection closed.");
                }
                catch (WebSocketException& exc)
                {
                    app.logger().log(exc);
                    switch (exc.code())
                    {
                    case WebSocket::WS_ERR_HANDSHAKE_UNSUPPORTED_VERSION:
                        response.set("Sec-WebSocket-Version", WebSocket::WEBSOCKET_VERSION);
                        // fallthrough
                    case WebSocket::WS_ERR_NO_HANDSHAKE:
                    case WebSocket::WS_ERR_HANDSHAKE_NO_VERSION:
                    case WebSocket::WS_ERR_HANDSHAKE_NO_KEY:
                        response.setStatusAndReason(HTTPResponse::HTTP_BAD_REQUEST);
                        response.setContentLength(0);
                        response.send();
                        break;
                    }
                }
            }
#if 0
            else
            {
            }
#endif
        }
        catch (WebSocketException& exc)
        {
            app.logger().log(exc);
            switch (exc.code())
            {
            case WebSocket::WS_ERR_HANDSHAKE_UNSUPPORTED_VERSION:
                response.set("Sec-WebSocket-Version", WebSocket::WEBSOCKET_VERSION);
                // fallthrough
            case WebSocket::WS_ERR_NO_HANDSHAKE:
            case WebSocket::WS_ERR_HANDSHAKE_NO_VERSION:
            case WebSocket::WS_ERR_HANDSHAKE_NO_KEY:
                response.setStatusAndReason(HTTPResponse::HTTP_BAD_REQUEST);
                response.setContentLength(0);
                response.send();
                break;
            }
        }
    }

private:
    LibreOfficeKit *_loKit;
};

class RequestHandlerFactory: public HTTPRequestHandlerFactory
{
public:
    RequestHandlerFactory(LibreOfficeKit *loKit) :
        _loKit(loKit)
    {
    }

    HTTPRequestHandler* createRequestHandler(const HTTPServerRequest& request) override
    {
        Application& app = Application::instance();
        app.logger().information("Request from " 
            + request.clientAddress().toString()
            + ": "
            + request.getMethod()
            + " "
            + request.getURI()
            + " "
            + request.getVersion());
            
        for (HTTPServerRequest::ConstIterator it = request.begin(); it != request.end(); ++it)
        {
            app.logger().information(it->first + ": " + it->second);
        }
        
        return new WebSocketRequestHandler(_loKit);
    }

private:
    LibreOfficeKit *_loKit;
};

class TestOutput: public Runnable
{
public:
    TestOutput(WebSocket& ws) :
        _ws(ws)
    {
    }

    void run() override
    {
        int flags;
        int n;
        do
        {
            char buffer[10240];
            n = _ws.receiveFrame(buffer, sizeof(buffer), flags);

            if (n > 0 && (flags & WebSocket::FRAME_OP_BITMASK) != WebSocket::FRAME_OP_CLOSE)
            {
                char *endl = (char *) memchr(buffer, '\n', n);
                std::string response;
                if (endl == NULL)
                    response = std::string(buffer, n);
                else
                    response = std::string(buffer, endl-buffer);
                std::cout << ">>" << n << " bytes: " << response << std::endl;
            }
        }
        while (n > 0 && (flags & WebSocket::FRAME_OP_BITMASK) != WebSocket::FRAME_OP_CLOSE);
    }

private:
    WebSocket& _ws;
};

class TestInput: public Runnable
{
public:
    TestInput(ServerApplication& main, ServerSocket& svs, HTTPServer& srv) :
        _main(main),
        _svs(svs),
        _srv(srv)
    {
    }

    void run() override
    {
        HTTPClientSession cs("localhost", _svs.address().port());
        HTTPRequest request(HTTPRequest::HTTP_GET, "/ws");
        HTTPResponse response;
        WebSocket ws(cs, request, response);

        Thread thread;
        TestOutput output(ws);
        thread.start(output);

        std::cout << std::endl;
        std::cout << "Enter LOOL WS requests, one per line. Enter EOF to finish." << std::endl;

        while (!std::cin.eof())
        {
            std::string line;
            std::getline(std::cin, line);
            ws.sendFrame(line.c_str(), line.size());
        }
        ws.shutdown();
        thread.join();
        _srv.stopAll();
        _main.terminate();
    }

private:
    ServerApplication& _main;
    ServerSocket& _svs;
    HTTPServer& _srv;
};

class LOOLWS: public Poco::Util::ServerApplication
{
public:
    LOOLWS() :
        _helpRequested(false),
        _portNumber(9980),
        _doTest(false)
    {
    }
    
    ~LOOLWS()
    {
    }

protected:
    void initialize(Application& self) override
    {
        ServerApplication::initialize(self);
    }
        
    void uninitialize() override
    {
        ServerApplication::uninitialize();
    }

    void defineOptions(OptionSet& options) override
    {
        ServerApplication::defineOptions(options);
        
        options.addOption(
            Option("help", "h", "display help information on command line arguments")
                .required(false)
                .repeatable(false));
        options.addOption(
            Option("port", "p", "port number to listen to (default:9980)")
                .required(false)
                .repeatable(false));
        options.addOption(
            Option("lopath", "l", "path to LibreOffice installation")
                .required(true)
                .repeatable(false)
                .argument("directory"));
        options.addOption(
            Option("test", "t", "interactive testing")
                .required(false)
                .repeatable(false));
    }

    void handleOption(const std::string& name, const std::string& value) override
    {
        ServerApplication::handleOption(name, value);

        if (name == "help")
        {
            displayHelp();
            exit(Application::EXIT_OK);
        }
        else if (name == "port")
            _portNumber = atoi(value.c_str());
        else if (name == "lopath")
            _loPath = value;
        else if (name == "test")
            _doTest = true;
    }

    void displayHelp()
    {
        HelpFormatter helpFormatter(options());
        helpFormatter.setCommand(commandName());
        helpFormatter.setUsage("OPTIONS");
        helpFormatter.setHeader("LibreOffice On-Line WebSocket server.");
        helpFormatter.format(std::cout);
    }

    int main(const std::vector<std::string>& args) override
    {
        LibreOfficeKit *loKit(lok_init(_loPath.c_str()));

        if (!loKit)
        {
            logger().fatal("LibreOfficeKit initialisation failed");
            exit(Application::EXIT_UNAVAILABLE);
        }

        ServerSocket svs(_portNumber);

        HTTPServer srv(new RequestHandlerFactory(loKit), svs, new HTTPServerParams);

        srv.start();

        Thread thread;
        TestInput input(*this, svs, srv);
        if (_doTest)
        {
            thread.start(input);
        }

        waitForTerminationRequest();

        srv.stop();

        if (_doTest)
            thread.join();

        return Application::EXIT_OK;
    }

private:
    bool _helpRequested;
    int _portNumber;
    std::string _loPath;
    bool _doTest;
};

POCO_SERVER_MAIN(LOOLWS)

/* vim:set shiftwidth=4 softtabstop=4 expandtab: */
