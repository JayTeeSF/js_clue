require "http/server"

# crystal build -Dpreview_mt --release clue_server.cr
# ./clue_server
#
# window 2a:
# curl "http://localhost:9292/"
#


def elapsed_text(elapsed)
  millis = elapsed.total_milliseconds
  return "#{millis.round(2)}ms" if millis >= 1

  "#{(millis * 1000).round(2)}µs"
end

def mime_type_for(ext)
  case ext
    when ".json"         then "application/json"
    when ".txt"          then "text/plain"
    when ".htm", ".html" then "text/html"
    when ".css"          then "text/css"
    when ".js"           then "application/javascript"
  else                      "application/octet-stream"
  end
end

def ext_for(path)
  File.extname(path)
end

def ext_and_mime_type_for(path)
  ext = ext_for(path)
  return [ext, mime_type_for(ext)]
end

HTMLMime = "text/html"
CSSMime = "text/css"
JSMime = "text/javascript"
ip   = ARGV[0]? ? ARGV[0] : "0.0.0.0"
port = ((ARGV[1]? ? ARGV[1] : "9292").to_i)

# There's a bug in the LogHandler that causes server to crash:
#
# server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new, HTTP::LogHandler.new]) do |context|
#

server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new]) do |context|
  st = Time.utc
  req = context.request
  res = context.response
  if req.method == "GET"
    file = nil
    case req.resource
    when "/clue", "/"
      file = "index.html"
      res.content_type = HTMLMime
    when "/clue/bootstrap.min.css"
      file = "bootstrap.min.css"
      res.content_type = CSSMime
    when "/clue/script.css"
      file = "script.css"
      res.content_type = CSSMime
    when "/clue/jquery-3.6.3.slim.min.js"
      file = "jquery-3.6.3.slim.min.js"
      res.content_type = JSMime
    when "/clue/script.js"
      file = "script.js"
      res.content_type = JSMime
    when "/clue/clue.js"
      file = "clue.js"
      res.content_type = JSMime
    when "/clue/bootstrap.bundle.min.js"
      file = "bootstrap.bundle.min.js"
      res.content_type = JSMime
    when "/clue/favicon.ico", "/favicon.ico"
      file = nil
    else
      file = nil
    end
    
    if file
      file_path = "./public/#{file}"
      content = File.read(file_path)
      res.output << content
      res.flush
    end
  end
  et = Time.utc
  puts(%Q|#{file.inspect} #{st} INFO - query_server: #{ip} - #{req.method} #{req.resource} #{req.version} - #{res.status_code} (#{elapsed_text(et - st)})|)

  next
end

puts "Listening on http://#{ip}:#{port}"
server.listen(ip, port)
