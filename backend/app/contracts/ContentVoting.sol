// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract ContentVoting {
    address public owner;
    IERC20 public fanToken;

    uint256 public contentCounter;

    enum ContentType { Image, Text, Audio }
    enum Description { Logo, Slogan, Tiffo, Vetement, Lyrics, Musique }

    struct Content {
        uint256 id;
        address creator;
        string ipfsUrl;
        ContentType contentType;
        Description description;
        uint256 votes;
    }

    mapping(uint256 => Content) public contents;
    mapping(uint256 => mapping(address => uint256)) public votesByUser; // contentId => voter => amount

    event ContentSubmitted(uint256 indexed contentId, address indexed creator);
    event VoteCast(uint256 indexed contentId, address indexed voter, uint256 amount);

    constructor(address _fanToken) {
        owner = msg.sender;
        fanToken = IERC20(_fanToken);
    }

    function submitContent(
        string memory _ipfsUrl,
        ContentType _type,
        Description _desc
    ) external {
        contentCounter += 1;
        contents[contentCounter] = Content({
            id: contentCounter,
            creator: msg.sender,
            ipfsUrl: _ipfsUrl,
            contentType: _type,
            description: _desc,
            votes: 0
        });

        emit ContentSubmitted(contentCounter, msg.sender);
    }

    function vote(uint256 _contentId, uint256 _amount) external {
        require(_contentId <= contentCounter, "Invalid content ID");
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer FAN tokens from voter to this contract
        require(fanToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        contents[_contentId].votes += _amount;
        votesByUser[_contentId][msg.sender] += _amount;

        emit VoteCast(_contentId, msg.sender, _amount);
    }

    function getContent(uint256 _id) external view returns (Content memory) {
        return contents[_id];
    }

    function getVotes(uint256 _id) external view returns (uint256) {
        return contents[_id].votes;
    }

    function withdrawTokens(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        require(fanToken.transferFrom(address(this), to, amount), "Transfer failed");
    }
}
