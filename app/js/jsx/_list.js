import React from 'react';
export default class List extends React.Component {
    constructor() {
        super();
        this.state = {
            liked: false
        }
    }

    handleClick(e) {
        this.setState({liked: !this.state.liked});
    }

    render() {
        var text = this.state.liked ? 'like' : 'haven\'t liked';
        return(
            <p onClick={e=>{this.handleClick(e)}}>
                you {text} Click to toggle.
            </p>
        );
    }
}
